type BlobInfo = {
    base64: string;
    file: File;
};
declare const global: any;
declare const regexPictureHeader: RegExp;
declare const regexPicture: RegExp;
declare const base64ToFile: (dataurl: any, filename?: string) => File;
declare const hexToBase64: (hexString: any) => string;
declare const getImagesHexSource: (node: any, rtfData?: string) => any;
declare const pasteWordPlugin: () => void;
