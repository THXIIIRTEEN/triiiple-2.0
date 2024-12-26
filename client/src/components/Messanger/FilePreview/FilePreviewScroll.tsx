import styles from "./FilePreviewScroll.module.css"

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