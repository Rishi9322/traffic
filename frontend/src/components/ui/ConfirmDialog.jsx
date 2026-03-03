import { Modal } from './Modal.jsx';

export function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Are you sure?', message, confirmLabel = 'Confirm', danger = false }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <p className="text-navy-300 mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
                <button onClick={onClose} className="btn-ghost">Cancel</button>
                <button
                    onClick={() => { onConfirm(); onClose(); }}
                    className={danger ? 'btn-danger' : 'btn-primary'}
                >
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
}
