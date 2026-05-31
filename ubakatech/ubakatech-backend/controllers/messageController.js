import prisma from '../config/db.js';

// Get all rooms the current employee is a member of
export const getRooms = async (req, res) => {
  const employeeId = req.user.id;
  try {
    // 1. Ensure the system "General" chat room exists
    let generalRoom = await prisma.chatRoom.findFirst({
      where: {
        isGroup: true,
        name: "General"
      }
    });

    if (!generalRoom) {
      generalRoom = await prisma.chatRoom.create({
        data: {
          name: "General",
          isGroup: true,
          isEncrypted: false
        }
      });
    }

    // 2. Ensure current employee is a member of General room
    const isGeneralMember = await prisma.chatRoomMember.findUnique({
      where: {
        roomId_employeeId: {
          roomId: generalRoom.id,
          employeeId: employeeId
        }
      }
    });

    if (!isGeneralMember) {
      await prisma.chatRoomMember.create({
        data: {
          roomId: generalRoom.id,
          employeeId: employeeId,
          role: 'member'
        }
      });
    }

    // 3. Find all ChatRooms where this employee is a member
    const rooms = await prisma.chatRoom.findMany({
      where: {
        members: {
          some: {
            employeeId: employeeId
          }
        }
      },
      include: {
        members: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                avatar: true,
                email: true,
                title: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const formattedRooms = await Promise.all(rooms.map(async (room) => {
      // Calculate unread count for current user
      const unreadCount = await prisma.message.count({
        where: {
          roomId: room.id,
          senderId: { not: employeeId },
          readReceipts: {
            none: {
              employeeId: employeeId
            }
          }
        }
      });

      let roomName = room.name;
      let roomAvatar = null;

      if (!room.isGroup) {
        const otherMember = room.members.find(m => m.employeeId !== employeeId);
        if (otherMember && otherMember.employee) {
          roomName = otherMember.employee.name;
          roomAvatar = otherMember.employee.avatar;
        } else {
          roomName = "Saved Messages";
          roomAvatar = req.user.avatar || null;
        }
      }

      return {
        id: room.id,
        name: roomName,
        avatar: roomAvatar,
        isGroup: room.isGroup,
        isEncrypted: room.isEncrypted,
        encryptionValidation: room.encryptionValidation,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        createdById: room.createdById,
        members: room.members.map(m => ({
          id: m.employee?.id || m.employeeId,
          name: m.employee?.name || "Unknown Member",
          avatar: m.employee?.avatar || null,
          email: m.employee?.email || "",
          title: m.employee?.title || "",
          role: m.role
        })),
        lastMessage: room.messages[0] ? {
          id: room.messages[0].id,
          content: room.messages[0].content,
          createdAt: room.messages[0].createdAt,
          senderName: room.messages[0].sender?.name || "Unknown",
          senderId: room.messages[0].senderId
        } : null,
        unreadCount
      };
    }));

    return res.json(formattedRooms);
  } catch (err) {
    console.error("Error in getRooms:", err.message);
    return res.status(500).json({ error: 'Failed to retrieve chat rooms' });
  }
};

// Create a new room (direct 1-to-1 or group chat)
export const createRoom = async (req, res) => {
  const { isGroup, name, isEncrypted, memberIds, encryptionValidation } = req.body;
  const creatorId = req.user.id;

  try {
    if (isGroup) {
      // HR and Admin roles check
      const isHROrAdmin = req.user.role === 'sysadmin' || req.user.role === 'hr_manager' || req.user.permissions?.includes('manage_hr');
      if (!isHROrAdmin) {
        return res.status(403).json({ error: 'Access Denied: Only HR and Administrators can create group chats' });
      }

      if (!name) {
        return res.status(400).json({ error: 'Group name is required' });
      }

      const uniqueMemberIds = Array.from(new Set([creatorId, ...(memberIds || [])]));

      const room = await prisma.chatRoom.create({
        data: {
          name,
          isGroup: true,
          isEncrypted: isEncrypted || false,
          encryptionValidation: isEncrypted ? encryptionValidation : null,
          createdById: creatorId,
          members: {
            create: uniqueMemberIds.map(empId => ({
              employeeId: empId,
              role: empId === creatorId ? 'admin' : 'member'
            }))
          }
        },
        include: {
          members: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  email: true,
                  title: true
                }
              }
            }
          }
        }
      });

      const formattedRoom = {
        id: room.id,
        name: room.name,
        avatar: null,
        isGroup: true,
        isEncrypted: room.isEncrypted,
        encryptionValidation: room.encryptionValidation,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        createdById: room.createdById,
        members: room.members.map(m => ({
          id: m.employee?.id || m.employeeId,
          name: m.employee?.name || "Unknown Member",
          avatar: m.employee?.avatar || null,
          email: m.employee?.email || "",
          title: m.employee?.title || "",
          role: m.role
        })),
        lastMessage: null,
        unreadCount: 0
      };

      if (req.io) {
        uniqueMemberIds.forEach(memberId => {
          req.io.to(`user_${memberId}`).emit('room_created', formattedRoom);
        });
      }

      return res.status(201).json(formattedRoom);
    } else {
      // 1-to-1 Direct Chat (DM)
      const targetId = memberIds?.[0];
      if (!targetId) {
        return res.status(400).json({ error: 'Target member ID is required for direct chat' });
      }

      // Check if a direct room already exists
      const existingRooms = await prisma.chatRoom.findMany({
        where: {
          isGroup: false,
          AND: [
            { members: { some: { employeeId: creatorId } } },
            { members: { some: { employeeId: targetId } } }
          ]
        },
        include: {
          members: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  email: true,
                  title: true
                }
              }
            }
          }
        }
      });

      const exactRoom = existingRooms.find(r => r.members.length === 2 || (creatorId === targetId && r.members.length === 1));

      if (exactRoom) {
        const targetMember = exactRoom.members.find(m => m.employeeId !== creatorId) || exactRoom.members[0];
        const formattedRoom = {
          id: exactRoom.id,
          name: creatorId === targetId ? "Saved Messages" : targetMember.employee.name,
          avatar: creatorId === targetId ? req.user.avatar : targetMember.employee.avatar,
          isGroup: false,
          isEncrypted: false,
          encryptionValidation: null,
          createdAt: exactRoom.createdAt,
          updatedAt: exactRoom.updatedAt,
          createdById: exactRoom.createdById,
          members: exactRoom.members.map(m => ({
            id: m.employee?.id || m.employeeId,
            name: m.employee?.name || "Unknown Member",
            avatar: m.employee?.avatar || null,
            email: m.employee?.email || "",
            title: m.employee?.title || "",
            role: m.role
          })),
          lastMessage: null,
          unreadCount: 0
        };
        return res.json(formattedRoom);
      }

      const uniqueMemberIds = creatorId === targetId ? [creatorId] : [creatorId, targetId];

      const room = await prisma.chatRoom.create({
        data: {
          isGroup: false,
          isEncrypted: false,
          createdById: creatorId,
          members: {
            create: uniqueMemberIds.map(empId => ({
              employeeId: empId,
              role: 'member'
            }))
          }
        },
        include: {
          members: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  email: true,
                  title: true
                }
              }
            }
          }
        }
      });

      const targetMember = room.members.find(m => m.employeeId !== creatorId) || room.members[0];
      const formattedRoom = {
        id: room.id,
        name: creatorId === targetId ? "Saved Messages" : (targetMember.employee?.name || "Unknown Member"),
        avatar: creatorId === targetId ? req.user.avatar : (targetMember.employee?.avatar || null),
        isGroup: false,
        isEncrypted: false,
        encryptionValidation: null,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        createdById: room.createdById,
        members: room.members.map(m => ({
          id: m.employee?.id || m.employeeId,
          name: m.employee?.name || "Unknown Member",
          avatar: m.employee?.avatar || null,
          email: m.employee?.email || "",
          title: m.employee?.title || "",
          role: m.role
        })),
        lastMessage: null,
        unreadCount: 0
      };

      if (req.io) {
        uniqueMemberIds.forEach(memberId => {
          req.io.to(`user_${memberId}`).emit('room_created', formattedRoom);
        });
      }

      return res.status(201).json(formattedRoom);
    }
  } catch (err) {
    console.error("Error in createRoom:", err.message);
    return res.status(500).json({ error: 'Failed to create chat room' });
  }
};

// Get all messages in a room
export const getRoomMessages = async (req, res) => {
  const { roomId } = req.params;
  const employeeId = req.user.id;

  try {
    const isMember = await prisma.chatRoomMember.findUnique({
      where: {
        roomId_employeeId: { roomId, employeeId }
      }
    });

    if (!isMember) {
      return res.status(403).json({ error: 'Access Denied: You are not a member of this chat room' });
    }

    const messages = await prisma.message.findMany({
      where: { roomId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        readReceipts: {
          include: {
            employee: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return res.json(messages);
  } catch (err) {
    console.error("Error in getRoomMessages:", err.message);
    return res.status(500).json({ error: 'Failed to retrieve messages' });
  }
};

// Send a message to a room
export const createMessage = async (req, res) => {
  const { roomId } = req.params;
  const { content } = req.body;
  const senderId = req.user.id;

  if (!content) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    const isMember = await prisma.chatRoomMember.findUnique({
      where: {
        roomId_employeeId: { roomId, employeeId: senderId }
      }
    });

    if (!isMember) {
      return res.status(403).json({ error: 'Access Denied: You are not a member of this chat room' });
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          content,
          roomId,
          senderId,
          readReceipts: {
            create: {
              employeeId: senderId
            }
          }
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          readReceipts: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      }),
      prisma.chatRoom.update({
        where: { id: roomId },
        data: { updatedAt: new Date() }
      })
    ]);

    if (req.io) {
      req.io.to(roomId).emit('receive_message', message);
    }

    return res.status(201).json(message);
  } catch (err) {
    console.error("Error in createMessage:", err.message);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};

// Mark all messages in a room as read by current user
export const markRoomAsRead = async (req, res) => {
  const { roomId } = req.params;
  const employeeId = req.user.id;

  try {
    const isMember = await prisma.chatRoomMember.findUnique({
      where: {
        roomId_employeeId: { roomId, employeeId }
      }
    });

    if (!isMember) {
      return res.status(403).json({ error: 'Access Denied: You are not a member of this chat room' });
    }

    const unreadMessages = await prisma.message.findMany({
      where: {
        roomId,
        readReceipts: {
          none: {
            employeeId
          }
        }
      },
      select: {
        id: true
      }
    });

    if (unreadMessages.length > 0) {
      await prisma.messageReadReceipt.createMany({
        data: unreadMessages.map(msg => ({
          messageId: msg.id,
          employeeId
        })),
        skipDuplicates: true
      });

      if (req.io) {
        req.io.to(roomId).emit('messages_read', {
          roomId,
          employeeId,
          messageIds: unreadMessages.map(msg => msg.id),
          readAt: new Date()
        });
      }
    }

    return res.json({ success: true, count: unreadMessages.length });
  } catch (err) {
    console.error("Error in markRoomAsRead:", err.message);
    return res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};
