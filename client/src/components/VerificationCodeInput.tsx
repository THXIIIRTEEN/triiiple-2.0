import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import { useRouter } from 'next/router';

interface VerificationCodeInputProps {
    email: string;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({ email }) => {
    const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const router = useRouter();
    
    const handleChange = (index: number, value: string) => {
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        const allFilled = newCode.every(char => char !== '');
        setIsComplete(allFilled);
    };

    const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        const pastedData = event.clipboardData.getData('Text').slice(0, 6);
        const newCode = pastedData.split('').slice(0, 6);
        setCode(newCode);

        if (newCode.length === 6) {
            inputRefs.current[5]?.focus();
        }

        const allFilled = newCode.every(char => char !== '');
        setIsComplete(allFilled);
    };

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        const sendCode = async () => {
            if (isComplete) {
                try {
                    const response = await axios.post(`${process.env.API_URI!}/users/verification`, { code: code.join(''), email });
                    if (response.status === 200) {
                        router.push('/profile')
                    }
                    else {
                        setError('Неправильный код')
                    }
                } catch (error) { 
                    console.error('Error sending code:', error);
                }
            }
        };
        sendCode();
    }, [isComplete, code, email, router]);

    return (
        <div style={{ display: 'flex', gap: '8px' }}>
            {code.map((_, index) => (
                <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={code[index]}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    ref={(el) => {
                        inputRefs.current[index] = el;
                    }}
                    style={{ width: '40px', textAlign: 'center' }}
                />
            ))}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default VerificationCodeInput;
