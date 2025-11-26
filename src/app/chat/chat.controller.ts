import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { MaterialCategory } from './entities/material.entity';
import { User } from '@/app/users/entities/user.entity';

import { ChatService } from './chat.service';

import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: User;
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      title: string;
      category: MaterialCategory;
      department?: string;
      yearLevel?: number;
      isPublic?: string;
    },
    @Req() req: RequestWithUser,
  ) {
    const user =
      req.user ??
      ({
        id: 'mock-user-id',
        department: 'Computer Science',
        yearOfStudy: 3,
      } as User);

    return this.chatService.saveMaterial(user, file, body);
  }

  @Post('message')
  sendMessage(
    @Body() body: { conversationId?: string; content: string },
    @Req() req: RequestWithUser,
  ) {
    const user =
      req.user ??
      ({
        id: 'mock-user-id',
        department: 'Computer Science',
        yearOfStudy: 3,
      } as User);

    return this.chatService.sendMessage(
      user,
      body.conversationId ?? null,
      body.content,
    );
  }

  @Get('history')
  getHistory(@Req() req: RequestWithUser) {
    const user = req.user ?? ({ id: 'mock-user-id' } as User);

    return this.chatService.getConversations(user);
  }

  @Get('history/:id')
  async getConversation(@Param('id') id: string, @Req() req: RequestWithUser) {
    const user = req.user ?? ({ id: 'mock-user-id' } as User);
    const conversation = await this.chatService.getConversation(id, user);
    const messages = await this.chatService.getMessages(id);

    return {
      id: conversation.id,
      title: conversation.title,
      userId: conversation.userId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages,
    };
  }

  @Get('materials')
  getMaterials(@Req() req: RequestWithUser) {
    const user =
      req.user ??
      ({
        id: 'mock-user-id',
        department: 'Computer Science',
        yearOfStudy: 3,
      } as User);

    return this.chatService.getMaterials(user);
  }
}
