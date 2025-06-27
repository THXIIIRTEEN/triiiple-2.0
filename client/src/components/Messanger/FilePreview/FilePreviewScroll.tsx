import styles from "./FilePreviewScroll.module.scss"

interface FilePreviewScrollProps {
    children: React.ReactNode;
}

const FilePreviewScroll: React.FC<FilePreviewScrollProps> = ({ children }) => {
    return (
        <div className={styles['container']}>
            {children}
        </div>
    );
};

export default FilePreviewScroll;