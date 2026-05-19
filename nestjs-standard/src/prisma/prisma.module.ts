/**
 * KHÁI NIỆM: Global Module — Import 1 lần, dùng mọi nơi
 *
 * @Global() decorator:
 * - BÌnh THƯỜNG: Module A muốn dùng Service của Module B
 *   → Module A phải import Module B vào imports[]
 * - @Global(): KHÔNG cần import — tự động available ở MỌI module
 *
 * TẠI SAO PrismaModule nên @Global():
 * - Prisma được dùng ở TẤT CẢ feature modules (users, posts, comments...)
 * - Nếu không @Global() → phải import PrismaModule vào 6+ modules = lặp lại
 * - @Global() → import 1 lần ở AppModule → xong
 *
 * LƯU Ý: Chỉ dùng @Global() cho services THẬT SỰ dùng ở mọi nơi
 * Không nên lạm dụng → khó track dependencies → "everything depends on everything"
 */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // ← Tất cả modules tự động truy cập PrismaService
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // ← Export để module khác inject được
})
export class PrismaModule {}
