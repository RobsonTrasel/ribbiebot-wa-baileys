import makeWASocket, { downloadMediaMessage, fetchLatestBaileysVersion, useMultiFileAuthState, UserFacingSocketConfig, WAMessage } from "@whiskeysockets/baileys";
import { BaileysClient } from "../src/modules/baileys";
import fs from 'fs/promises'

jest.mock('@whiskeysockets/baileys', () => ({
    ...jest.requireActual('@whiskeysockets/baileys'),
    makeWASocket: jest.fn(),
}));

jest.mock('fs/promises');

describe('BaileysClient', () => {
    let client: ReturnType<typeof makeWASocket>;
    let baileysClient: BaileysClient;
    let mockMessage: WAMessage;

    beforeEach(async () => {
        const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');
        const { version } = await fetchLatestBaileysVersion();

        const config: UserFacingSocketConfig = {
            auth: state,
            version,
            printQRInTerminal: false,
        };

        client = makeWASocket(config);
        baileysClient = new BaileysClient(client);
        mockMessage = {
            key: { remoteJid: '12345' },
            message: { conversation: 'Hello' },
        } as unknown as WAMessage;
        baileysClient.setMessageObject(mockMessage);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should set and get client', () => {
        expect(baileysClient.getClient()).toBe(client);
    });

    it('should set and get message object', () => {
        expect(baileysClient.messageObject).toBe(mockMessage);
    });

    it('should reply to author', async () => {
        client.sendMessage = jest.fn();
        await baileysClient.replyAuthor('Hello there');
        expect(client.sendMessage).toHaveBeenCalledWith('12345', { text: 'Hello there' }, { quoted: mockMessage });
    });

    it('should send a message', async () => {
        client.sendMessage = jest.fn();
        await baileysClient.sendMessage('Test message');
        expect(client.sendMessage).toHaveBeenCalledWith('12345', { text: 'Test message' });
    });

    it('should send a file', async () => {
        client.sendMessage = jest.fn();
        (fs.readFile as jest.Mock).mockResolvedValue(Buffer.from('file content'));
        await baileysClient.sendFile('path/to/file', 'Test caption');
        expect(client.sendMessage).toHaveBeenCalledWith('12345', {
            document: Buffer.from('file content'),
            mimetype: 'application/octet-stream',
            fileName: 'file',
            caption: 'Test caption',
        });
    });

    it('should send a song', async () => {
        client.sendMessage = jest.fn();
        (fs.readFile as jest.Mock).mockResolvedValue(Buffer.from('file content'));
        await baileysClient.sendSong('path/to/file', 'Test caption');
        expect(client.sendMessage).toHaveBeenCalledWith('12345', {
            audio: { url: 'path/to/file' },
            mimetype: 'audio/mp4',
            caption: 'Test caption',
        });
    });

    it('should get media buffer from file', async () => {
        (fs.readFile as jest.Mock).mockResolvedValue(Buffer.from('file content'));
        const buffer = await baileysClient.getMediaBuffer('path/to/file');
        expect(buffer).toEqual(Buffer.from('file content'));
    });

    it('should get media buffer from message', async () => {
        (downloadMediaMessage as jest.Mock).mockResolvedValue(Buffer.from('media content'));
        const buffer = await baileysClient.getMediaBufferFromMessage();
        expect(buffer).toEqual(Buffer.from('media content'));
    });

    it('should send a sticker', async () => {
        client.sendMessage = jest.fn();
        (fs.readFile as jest.Mock).mockResolvedValue(Buffer.from('file content'));
        await baileysClient.sendSticker('path/to/file');
        expect(client.sendMessage).toHaveBeenCalledWith('12345', { sticker: Buffer.from('file content') });
    });

    it('should send a video sticker', async () => {
        client.sendMessage = jest.fn();
        await baileysClient.sendVideoSticker(Buffer.from('video content'), 'video/mp4');
        expect(client.sendMessage).toHaveBeenCalledWith('12345', { sticker: Buffer.from('video content') });
    });

    it('should send a file from URL', async () => {
        client.sendMessage = jest.fn();
        await baileysClient.sendFileFromUrl('http://example.com/file', 'file', mockMessage, 'Test caption');
        expect(client.sendMessage).toHaveBeenCalledWith('12345', {
            document: { url: 'http://example.com/file' },
            mimetype: 'application/octet-stream',
            fileName: 'file',
            caption: 'Test caption',
        });
    });

    it('should send an image from URL', async () => {
        client.sendMessage = jest.fn();
        await baileysClient.sendImageFromUrl('http://example.com/image.jpg', 'Test caption', mockMessage);
        expect(client.sendMessage).toHaveBeenCalledWith('12345', {
            image: { url: 'http://example.com/image.jpg' },
            caption: 'Test caption',
        });
    });

    it('should send a file from buffer', async () => {
        client.sendMessage = jest.fn();
        await baileysClient.sendFileFromBuffer(Buffer.from('file content'), 'application/octet-stream', 'Test caption', mockMessage);
        expect(client.sendMessage).toHaveBeenCalledWith('12345', {
            document: Buffer.from('file content'),
            mimetype: 'application/octet-stream',
            fileName: 'file',
            caption: 'Test caption',
        });
    });

    it('should send a video', async () => {
        client.sendMessage = jest.fn();
        await baileysClient.sendVideo('http://example.com/video.mp4', 'video', mockMessage, 'Test caption');
        expect(client.sendMessage).toHaveBeenCalledWith('12345', {
            video: { url: 'http://example.com/video.mp4' },
            caption: 'Test caption',
            fileName: 'video',
        });
    });

    it('should check if requester is admin', async () => {
        client.groupMetadata = jest.fn().mockResolvedValue({
            participants: [{ id: '12345', admin: true }],
        });
        const isAdmin = await baileysClient.isAdmin(mockMessage);
        expect(isAdmin).toBe(true);
    });

})