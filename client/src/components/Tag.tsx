
interface TagProps {
    className?: string;
    tag: string
}

const Tag: React.FC<TagProps> = ({ className, tag }) => {
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(`${process.env.FRONTEND_URL}/profile/${tag}`);
            alert("Ссылка на страницу пользователя скопирована");
        } catch (err) {
            alert(err);
        }
    };
    return (
        <p onClick={handleCopy} className={className}>{`@${tag}`}</p>
    )
}

export default Tag;