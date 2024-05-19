import makeWASocket, {
    AnyMessageContent,
    downloadMediaMessage,
    WAMessage,
    MediaDownloadOptions,
} from '@whiskeysockets/baileys';
import fs from 'fs/promises';
import { Button, Mimetype } from '../../types';


export class BaileysClient {
    client: ReturnType<typeof makeWASocket>
    messageObject: WAMessage | null

    constructor(client: ReturnType<typeof makeWASocket>) {
        this.client = client;
        this.messageObject = null;
    }

    getClient() {
        return this.client;
    }

    getQuotedMessage() {
        return this.messageObject?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    }

    setMessageObject(message: WAMessage) {
        this.messageObject = message;
    }

    async replyAuthor(message: string, author?: WAMessage) {
        if (!this.messageObject) throw 'No message object initialized';
        const jid = author?.key.remoteJid || this.messageObject.key.remoteJid;
        await this.client.sendMessage(jid!, { text: message }, { quoted: author || this.messageObject });
    }

    async sendMessage(message: string, requester?: WAMessage) {
        if (!this.messageObject) throw 'No message object initialized';
        const jid = requester?.key.remoteJid || this.messageObject.key.remoteJid;
        await this.client.sendMessage(jid!, { text: message });
    }

    async sendButtons(
        caption: string,
        buttons: Button[],
        requester?: WAMessage,
        title?: string
    ) {
        if (!this.messageObject) throw 'No message object initialized';
        const jid = requester?.key.remoteJid || this.messageObject.key.remoteJid;

        const buttonMessage: AnyMessageContent = {
            text: caption,
            buttons: buttons.map(button => ({
                buttonId: button.id,
                buttonText: { displayText: button.text },
                type: 1,
            })),
            footer: title,
        };

        await this.client.sendMessage(jid!, buttonMessage);
    }

    async sendFile(fileAddress: string, caption: string, quotedMessage?: WAMessage) {
        if (!this.messageObject) throw 'No message object initialized';
        const jid = quotedMessage?.key.remoteJid || this.messageObject.key.remoteJid;
        const buffer = await fs.readFile(fileAddress);
        const mimetype = this.getMimeType(fileAddress);
        await this.client.sendMessage(jid!, { document: buffer, mimetype, fileName: 'file', caption });
    }
    async sendSong(fileAddress: string, caption: string, quotedMessage?: WAMessage) {
        if (!this.messageObject) throw 'No message object initialized';
        const jid = quotedMessage?.key.remoteJid || this.messageObject.key.remoteJid;
        const buffer = await fs.readFile(fileAddress);
        await this.client.sendMessage(jid!, { audio: { url: fileAddress }, mimetype: 'audio/mp4', caption });
    }

    async getMediaBuffer(mediaAddress: string) {
        const media = await fs.readFile(mediaAddress);
        return Buffer.from(media);
    }

    async getMediaBufferFromMessage(quotedMessage?: WAMessage) {
        if (!this.messageObject) throw 'No message object initialized';
        const message = quotedMessage || this.messageObject;
        if (!message.message?.imageMessage && !message.message?.videoMessage) throw 'No media sent on message';

        const options: MediaDownloadOptions = {
            'options': {
                timeout: 5000,
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'BaileysClient'
                }
            }
        };

        const media = await downloadMediaMessage(message, 'buffer', options);
        return media;
    }


    getBase64fromBuffer(buffer: Buffer, mimetype: Mimetype) {
        return `data:${mimetype};base64,${buffer.toString('base64')}`;
    }

    async sendSticker(imgBufferOrAddress: string | Buffer, requester?: WAMessage) {
        if (!this.messageObject) throw 'No message object initialized';
        const jid = requester?.key.remoteJid || this.messageObject.key.remoteJid;
        let imgBuffer: Buffer;

        if (typeof imgBufferOrAddress === 'string') {
            imgBuffer = await this.getMediaBuffer(imgBufferOrAddress);
        } else {
            imgBuffer = imgBufferOrAddress;
        }

        await this.client.sendMessage(jid!, { sticker: imgBuffer });
    }

    async sendVideoSticker(videoBuffer: Buffer, mimetype: Mimetype, requester?: WAMessage) {
        if (!this.messageObject) throw 'No message object initialized';
        const jid = requester?.key.remoteJid || this.messageObject.key.remoteJid;
        await this.client.sendMessage(jid!, { sticker: videoBuffer });
    }

    async sendFileFromUrl(url: string, fileName: string, requester: WAMessage, caption = "") {
        const message = requester || this.messageObject;
        if (!message) throw 'No message object initialized';
        await this.client.sendMessage(requester.key.remoteJid!, {
            document: { url },
            mimetype: 'application/octet-stream',
            fileName,
            caption,
        });
    }

    async sendImageFromUrl(url: string, caption?: string, requester?: WAMessage) {
        try {
            if (!this.messageObject) throw 'No message object initialized';
            await this.client.sendMessage(
                requester?.key.remoteJid || this.messageObject.key.remoteJid!,
                { image: { url }, caption }
            );
        } catch (e) {
            await this.replyAuthor("erro desconhecido", requester);
        }
    }

    async sendFileFromBuffer(buffer: Buffer, mimeType: Mimetype, caption = "", requester: WAMessage) {
        try {
            await this.client.sendMessage(requester.key.remoteJid!, { document: buffer, mimetype: mimeType, fileName: 'file', caption });
        } catch (e) {
            await this.replyAuthor(JSON.stringify(e), requester);
        }
    }

    async sendVideo(url: string, name: string, requester: WAMessage, caption = "") {
        try {
            await this.client.sendMessage(requester.key.remoteJid!, { video: { url }, caption, fileName: name });
        } catch (e) {
            await this.replyAuthor(JSON.stringify(e), requester);
        }
    }

    async isAdmin(requester: WAMessage) {
        if (!requester.key.remoteJid) return true;
        const groupMetadata = await this.client.groupMetadata(requester.key.remoteJid);
        const allAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
        return allAdmins.includes(requester.key.participant!);
    }


    private getMimeType(fileAddress: string): string {
        const extension = fileAddress.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'mp4': return 'video/mp4';
            case 'gif': return 'image/gif';
            case 'jpeg':
            case 'jpg': return 'image/jpeg';
            case 'png': return 'image/png';
            case 'pdf': return 'application/pdf';
            case 'doc':
            case 'docx': return 'application/msword';
            default: return 'application/octet-stream';
        }
    }

}