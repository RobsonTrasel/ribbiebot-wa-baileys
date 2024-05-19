
import fs from 'fs/promises';
import { downloadMediaMessage, WAMessage } from '@whiskeysockets/baileys';
import { BaileysClient } from '../src/modules/baileys';
import { Button } from '../src/types';

// Mock do Baileys
jest.mock('@whiskeysockets/baileys', () => ({
    downloadMediaMessage: jest.fn(),
}));

// Mock do fs.promises
jest.mock('fs/promises');

describe('BaileysClient', () => {
    let clientMock: any;
    let baileysClient: BaileysClient;
    let mockMessage: WAMessage;

    beforeEach(() => {
        clientMock = {
            sendMessage: jest.fn(),
            groupMetadata: jest.fn(),
        };
        baileysClient = new BaileysClient(clientMock);
        mockMessage = {
            key: { remoteJid: '12345' },
            message: { conversation: 'Hello' },
        } as unknown as WAMessage;
        baileysClient.setMessageObject(mockMessage);
    });

    it('should set and get client', () => {
        expect(baileysClient.getClient()).toBe(clientMock);
    });

    it('should set and get message object', () => {
        expect(baileysClient.messageObject).toBe(mockMessage);
    });

    it('should get quoted message', () => {
        mockMessage.message = {
            extendedTextMessage: {
                contextInfo: { quotedMessage: { conversation: 'Quoted' } },
            },
        } as any;
        expect(baileysClient.getQuotedMessage()).toEqual({ conversation: 'Quoted' });
    });

    it('should reply to author', async () => {
        await baileysClient.replyAuthor('Hello there');
        expect(clientMock.sendMessage).toHaveBeenCalledWith('12345', { text: 'Hello there' }, { quoted: mockMessage });
    });

    it('should send a message', async () => {
        await baileysClient.sendMessage('Test message');
        expect(clientMock.sendMessage).toHaveBeenCalledWith('12345', { text: 'Test message' });
    });

    it('should send buttons', async () => {
        const buttons: Button[] = [{ id: '1', text: 'Button 1' }];
        await baileysClient.sendButtons('Test caption', buttons, mockMessage, 'Test title');
        expect(clientMock.sendMessage).toHaveBeenCalledWith('12345', {
            text: 'Test caption',
            buttons: [{ buttonId: '1', buttonText: { displayText: 'Button 1' }, type: 1 }],
            footer: 'Test title',
        });
    });

    it('should send a file', async () => {
        const fileContent = Buffer.from('file content');
        (fs.readFile as jest.Mock).mockResolvedValue(fileContent);
        await baileysClient.sendFile('path/to/file', 'Test caption');
        expect(clientMock.sendMessage).toHaveBeenCalledWith('12345', {
            document: fileContent,
            mimetype: 'application/octet-stream',
            fileName: 'file',
            caption: 'Test caption',
        });
    });

    it('should send a song', async () => {
        const fileContent = Buffer.from('file content');
        (fs.readFile as jest.Mock).mockResolvedValue(fileContent);
        await baileysClient.sendSong('path/to/file', 'Test caption');
        expect(clientMock.sendMessage).toHaveBeenCalledWith('12345', {
            audio: { url: 'path/to/file' },
            mimetype: 'audio/mp4',
            caption: 'Test caption',
        });
    });

    it('should get media buffer from file', async () => {
        const fileContent = Buffer.from('file content');
        (fs.readFile as jest.Mock).mockResolvedValue(fileContent);
        const buffer = await baileysClient.getMediaBuffer('path/to/file');
        expect(buffer).toEqual(fileContent);
    });

    it('should get media buffer from message', async () => {
        mockMessage.message = {
            imageMessage: {
                url: 'http://example.com/image.jpg',
                mimetype: 'image/jpeg',
            },
        } as any;
        
        const mediaContent = Buffer.from('media content');
        (downloadMediaMessage as jest.Mock).mockResolvedValue(mediaContent);
        const buffer = await baileysClient.getMediaBufferFromMessage();
        expect(buffer).toEqual(mediaContent);
    });

    it('should convert buffer to base64', () => {
        const buffer = Buffer.from('test');
        const base64 = baileysClient.getBase64fromBuffer(buffer, 'application/octet-stream');
        expect(base64).toEqual('data:application/octet-stream;base64,dGVzdA==');
    });

    it('should send a sticker', async () => {
        const fileContent = Buffer.from('file content');
        (fs.readFile as jest.Mock).mockResolvedValue(fileContent);
        await baileysClient.sendSticker('path/to/file');
        expect(clientMock.sendMessage).toHaveBeenCalledWith('12345', { sticker: fileContent });
    });

    it('should send a video sticker', async () => {
        const videoContent = Buffer.from('video content');
        await baileysClient.sendVideoSticker(videoContent, 'video/mp4');
        expect(clientMock.sendMessage).toHaveBeenCalledWith('12345', { sticker: videoContent });
    });

    it('should send a file from URL', async () => {
        await baileysClient.sendFileFromUrl('http://example.com/file', 'file', mockMessage, 'Test caption');
        expect(clientMock.sendMessage).toHaveBeenCalledWith('12345', {
            document: { url: 'http://example.com/file' },
            mimetype: 'application/octet-stream',
            fileName: 'file',
            caption: 'Test caption',
        });
    });

    it('should send an image from URL', async () => {
        await baileysClient.sendImageFromUrl('http://example.com/image.jpg', 'Test caption', mockMessage);
        expect(clientMock.sendMessage).toHaveBeenCalledWith('12345', {
            image: { url: 'http://example.com/image.jpg' },
            caption: 'Test caption',
        });
    });

    it('should send a file from buffer', async () => {
        const fileContent = Buffer.from('file content');
        await baileysClient.sendFileFromBuffer(fileContent, 'application/octet-stream', 'Test caption', mockMessage);
        expect(clientMock.sendMessage).toHaveBeenCalledWith('12345', {
            document: fileContent,
            mimetype: 'application/octet-stream',
            fileName: 'file',
            caption: 'Test caption',
        });
    });

    it('should send a video', async () => {
        await baileysClient.sendVideo('http://example.com/video.mp4', 'video', mockMessage, 'Test caption');
        expect(clientMock.sendMessage).toHaveBeenCalledWith('12345', {
            video: { url: 'http://example.com/video.mp4' },
            caption: 'Test caption',
            fileName: 'video',
        });
    });

    it('should check if requester is admin', async () => {
        const mockGroupMetadata = {
            participants: [
                { id: '12345', admin: 'admin' },
                { id: '67890' },
            ],
        };
        clientMock.groupMetadata.mockResolvedValue(mockGroupMetadata);
        mockMessage.key.participant = '12345';
        const isAdmin = await baileysClient.isAdmin(mockMessage);
        expect(isAdmin).toBe(true);
    });

    it('should get mimetype based on file extension', () => {
        expect(baileysClient['getMimeType']('file.mp4')).toBe('video/mp4');
        expect(baileysClient['getMimeType']('file.gif')).toBe('image/gif');
        expect(baileysClient['getMimeType']('file.jpeg')).toBe('image/jpeg');
        expect(baileysClient['getMimeType']('file.jpg')).toBe('image/jpeg');
        expect(baileysClient['getMimeType']('file.png')).toBe('image/png');
        expect(baileysClient['getMimeType']('file.pdf')).toBe('application/pdf');
        expect(baileysClient['getMimeType']('file.doc')).toBe('application/msword');
        expect(baileysClient['getMimeType']('file.docx')).toBe('application/msword');
        expect(baileysClient['getMimeType']('file.unknown')).toBe('application/octet-stream');
    });
});
