import Link from "next/link";
import styles from "./OauthButton.module.css" ;

interface OauthButtonProps {
    text: string;
    link: string;
    style: string
};

const OauthButton: React.FC<OauthButtonProps> = ({ text, link, style }) => {
    return (
        <>
            <Link href={link} className={styles[`button ${style}`]}>
                {text}
            </Link>
        </>
    )
};

export default OauthButton;