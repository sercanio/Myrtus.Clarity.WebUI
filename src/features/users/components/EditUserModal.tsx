import { Modal, Button, Checkbox } from 'antd';
import type { UserInfo } from '@/types/user';
import type { Role } from '@/types/role';

interface EditUserModalProps {
    visible: boolean;
    onClose: () => void;
    selectedUser: UserInfo | null;
    roles: Role[];
    selectedRoles: Set<string>;
    onRoleChange: (roleId: string, checked: boolean) => Promise<void>;
}

export const EditUserModal = ({
    visible,
    onClose,
    selectedUser,
    roles,
    selectedRoles,
    onRoleChange
}: EditUserModalProps) => (
    <Modal
        title="Edit User Roles"
        open={visible}
        onCancel={onClose}
        footer={[
            <Button key="close" onClick={onClose}>
                Close
            </Button>,
        ]}
    >
        {selectedUser && (
            <>
                <div style={{ marginBottom: 16 }}>
                    <div>
                        <strong>Name: </strong>
                        &nbsp;{selectedUser.firstName.value} {selectedUser.lastName.value}
                    </div>
                    <div>
                        <strong>Email: </strong>
                        &nbsp;{selectedUser.email.value}
                    </div>
                </div>
                <div>
                    <strong>Roles:</strong>
                    {roles.map((role) => (
                        <div key={role.id} style={{ marginTop: 8 }}>
                            <Checkbox
                                checked={selectedRoles.has(role.id)}
                                onChange={(e) => onRoleChange(role.id, e.target.checked)}
                            >
                                {role.name}
                            </Checkbox>
                        </div>
                    ))}
                </div>
            </>
        )}
    </Modal>
); 