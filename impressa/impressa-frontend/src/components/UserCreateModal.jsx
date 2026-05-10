import UserCreateForm from "./UserCreateForm";


function UserCreateModal({ isOpen, onClose, onUserCreated }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-charcoal-800 rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 dark:border-charcoal-700">
          <h3 className="text-lg font-bold text-charcoal-800 dark:text-white">Create New User</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-charcoal-400 hover:text-charcoal-600 hover:bg-cream-100 dark:hover:bg-charcoal-700 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <UserCreateForm
            onSuccess={() => {
              onUserCreated?.();
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}

export default UserCreateModal;
