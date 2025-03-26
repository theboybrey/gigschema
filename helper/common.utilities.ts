import { notifier } from "@/components/notifier";

export function GetRandomItem<T>(items: Array<T>): T {
  if (!Array.isArray(items) || items.length === 0) {
    notifier.error("Invalid input", "Error");
    throw new Error("Invalid input");
  }
  return items[Math.floor(Math.random() * items.length)];
}

export function ObjectToString(obj: any): string {
  return Object.prototype.toString.call(obj);
}

/**
 * @function GenerateKey
 * @description Generate a random key 
 * @param length 
 * @returns 
 */


export function GenerateKey(length: number): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < length; i++) {
        key += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return key;
}

type IdentifierType = "email" | "phone" | "username";


/**
 * @function ConvertStringTorKey
 * @description Coverts a string to a key
 * @example ConvertStringTorKey('Hello World') => 'helloWorld'
 * @param str
 * @returns 
 */
export function ConvertStringTorKey(str: string): string {
    const lowerCase = str.toLowerCase();
    const split = lowerCase.split(" ");
    const result = split.map((word, index) => {
        if (index === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return result.join("");
}

/**
 * @function GetLastPathFromUrl
 * @description Get the last path from a url
 * @param url 
 * @returns 
 */
export function GetLastPathFromUrl(url: string): string {
    const split = url.split("/");
    return split[split.length - 1];
}

const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    return true;
};

const validateIdentifier = (value: string) => {
    if (!value) return "This field is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

    if (emailRegex.test(value)) {
        return true;
    }
    if (phoneRegex.test(value)) {
        return true;
    }
    if (usernameRegex.test(value)) {
        return true;
    }

    return "Please enter a valid email, phone number, or username";
};

const detectIdentifierType = (value: string): IdentifierType => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

    if (emailRegex.test(value)) return "email";
    if (phoneRegex.test(value)) return "phone";
    if (usernameRegex.test(value)) return "username";
    return "email";
};






export {
    validatePassword,
    validateIdentifier,
    detectIdentifierType
}