import AvatarInput from "@/components/AvatarInput";
import EditDataInput from "@/components/Settings/EditDataInput";
import { useAuthStore } from "@/utils/store";
import { useState } from "react";
import { UserData } from "@/types/registration";
import UserAvatar from "@/components/UserAvatar";
import MessageForm from "@/components/Messanger/MessageForm/MessageForm";

const SettingsPage: React.FC = () => {

    const [formValues, setFormValues] = useState<UserData>({
        username: '',
        tag: '',
        email: '',
        password: ''
    });
    const user = useAuthStore(state => state.user); 

    return (
        <div>
            {   user &&
                <>
                <h2>Аватар</h2>
                <AvatarInput user={user}/>
                <UserAvatar id={user?.id}/>
                <h2>Почта</h2>
                <EditDataInput name='email' placeholder={`${user.email}`} type='email' value={formValues.email} autoComplete='email' setFormValues={setFormValues}/>
                <h2>Отображаемое Имя</h2>
                <EditDataInput name='username' placeholder={`${user.username}`} type='text' minLength={4} maxLength={16} value={formValues.username || ''} autoComplete='new-password' setFormValues={setFormValues} />
                <h2>Имя пользователя</h2>
                <EditDataInput name='tag' placeholder={`${user.tag}`} type='text' minLength={4} maxLength={16} value={formValues.tag || ''} autoComplete='new-password' setFormValues={setFormValues} />
                <h2>Пароль</h2>
                <EditDataInput name='password' placeholder='******' type='password' minLength={6} maxLength={32} value={formValues.password} autoComplete='new-password' setFormValues={setFormValues}/>
                <h2>Обо Мне</h2>
                <MessageForm type="send" page={'AboutUser'} user={user}/>
                </>
            }
        </div>
    )
}

export default SettingsPage;