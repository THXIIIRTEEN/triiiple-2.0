
interface UsernameProps {
    className?: string;
    username: string | null | undefined; 
    tag: string
}

const Username: React.FC<UsernameProps> = ({ className, username, tag }) => {
    return (
        <>
        {
            !username ?
                <p className={className}>{tag}</p>
            :
                <p className={className}>{username}</p>
        }
        </>
    )
}

export default Username;