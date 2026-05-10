const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'abelus-backend/controllers/orderController.js');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add Imports
if (!content.includes('import ClientAbonne')) {
    content = content.replace(
        /import Shift from "\.\.\/models\/Shift\.js";/,
        `import Shift from "../models/Shift.js";\nimport ClientAbonne from "../models/ClientAbonne.js";\nimport AbonneTransaction from "../models/AbonneTransaction.js";`
    );
}

// 2. Destructure new body params
content = content.replace(
    /const { items, paymentMethod, storeLocation } = req\.body;/,
    `const { items, paymentMethod, storeLocation, abonneId, upfrontCashPaid } = req.body;`
);

// 3. Update order payment creation logic
const orderCreationTarget = `      payment: {
        method: paymentMethod || "cash",
        status: "completed",
        paidAt: new Date()
      },`;
const orderCreationReplacement = `      payment: {
        method: paymentMethod || "cash",
        status: paymentMethod === "client_abonne" ? "pending" : "completed",
        paidAt: paymentMethod === "client_abonne" ? undefined : new Date()
      },`;
content = content.replace(orderCreationTarget, orderCreationReplacement);

// 4. Update Shift logic and add Abonne logic
const shiftLogicTarget = `    // UPDATE ACTIVE SHIFT
    try {
      const activeShift = await Shift.findOne({ user: userId, status: "open" });
      if (activeShift) {
        activeShift.orders.push(order._id);
        if (paymentMethod === "mtn_momo") {
          activeShift.totalMomoSales += subtotal;
        } else if (paymentMethod === "cash" || !paymentMethod) {
          activeShift.totalCashSales += subtotal;
          activeShift.expectedEndingDrawerAmount += subtotal;
        } else {
          activeShift.totalOtherSales += subtotal;
        }
        await activeShift.save();
      }
    } catch (shiftErr) {
      console.error("Failed to update active shift:", shiftErr);
    }`;

const newLogic = `    // UPDATE ACTIVE SHIFT AND ABONNE DEBT
    try {
      let cashCollected = 0;
      let momoCollected = 0;

      if (paymentMethod === "client_abonne") {
        cashCollected = Number(upfrontCashPaid) || 0;
        
        // Handle Fiche / Debt creation
        const client = await ClientAbonne.findById(abonneId);
        if (client) {
            let remainingUpfront = cashCollected;
            
            for (const item of orderItems) {
                let paidForItem = 0;
                if (remainingUpfront >= item.subtotal) {
                    paidForItem = item.subtotal;
                    remainingUpfront -= item.subtotal;
                } else if (remainingUpfront > 0) {
                    paidForItem = remainingUpfront;
                    remainingUpfront = 0;
                }

                const debtAmount = item.subtotal - paidForItem;

                await AbonneTransaction.create({
                    client: client._id,
                    order: order._id,
                    designation: item.productName,
                    quantity: item.quantity,
                    pu: item.price,
                    pt: item.subtotal,
                    amountPaid: paidForItem,
                    debtAmount: debtAmount,
                    status: debtAmount === 0 ? "paid" : (paidForItem > 0 ? "partially_paid" : "unpaid"),
                    responsible: userId
                });

                client.totalDebt += debtAmount;
            }
            await client.save();
        }
      } else if (paymentMethod === "mtn_momo") {
        momoCollected = subtotal;
      } else {
        // default cash
        cashCollected = subtotal;
      }

      // Update Shift
      const activeShift = await Shift.findOne({ user: userId, status: "open" });
      if (activeShift) {
        activeShift.orders.push(order._id);
        activeShift.totalCashSales += cashCollected;
        activeShift.expectedEndingDrawerAmount += cashCollected;
        activeShift.totalMomoSales += momoCollected;
        await activeShift.save();
      }
    } catch (err) {
      console.error("Failed to update shift/abonne:", err);
    }`;

content = content.replace(shiftLogicTarget, newLogic);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Patched orderController.js');
