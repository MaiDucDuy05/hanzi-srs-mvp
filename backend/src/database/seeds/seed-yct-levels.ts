import dataSource from '../data-source';
import { YctLevel } from '../../modules/yct-curriculum/entities/yct-level.entity';
import { YctLesson } from '../../modules/yct-curriculum/entities/yct-lesson.entity';
import { YctVocabulary } from '../../modules/yct-curriculum/entities/yct-vocabulary.entity';
import { ContentStatus } from '../../common/enums/curriculum.enums';

/**
 * Seed 6 cấp độ YCT1 - YCT6 kèm bài học và từ vựng mẫu có hình ảnh cho thiếu nhi.
 * Chạy: npx tsx src/database/seeds/seed-yct-levels.ts
 */
const YCT_LEVELS = [
  {
    code: 'YCT1',
    name: 'YCT Cấp 1',
    description: 'Dành cho trẻ em mới làm quen tiếng Trung. ~80 từ vựng cơ bản nhất (chào hỏi, số đếm, gia đình, động vật).',
    displayOrder: 1,
    status: ContentStatus.PUBLISHED,
    isActive: true,
  },
  {
    code: 'YCT2',
    name: 'YCT Cấp 2',
    description: 'Khoảng 150 từ vựng. Trẻ có thể giao tiếp các câu đơn giản hàng ngày và trường lớp.',
    displayOrder: 2,
    status: ContentStatus.PUBLISHED,
    isActive: true,
  },
  {
    code: 'YCT3',
    name: 'YCT Cấp 3',
    description: 'Khoảng 300 từ vựng. Giao tiếp tự tin trong sinh hoạt hàng ngày.',
    displayOrder: 3,
    status: ContentStatus.PUBLISHED,
    isActive: true,
  },
  {
    code: 'YCT4',
    name: 'YCT Cấp 4',
    description: 'Khoảng 600 từ vựng. Có khả năng hoàn thành bài thi YCT 4 và giao tiếp thành thạo.',
    displayOrder: 4,
    status: ContentStatus.PUBLISHED,
    isActive: true,
  },
  {
    code: 'YCT5',
    name: 'YCT Cấp 5',
    description: 'Khoảng 1000 từ vựng nâng cao cho thanh thiếu niên.',
    displayOrder: 5,
    status: ContentStatus.PUBLISHED,
    isActive: true,
  },
  {
    code: 'YCT6',
    name: 'YCT Cấp 6',
    description: 'Khoảng 1500 từ vựng cao cấp, tiệm cận HSK 4-5.',
    displayOrder: 6,
    status: ContentStatus.PUBLISHED,
    isActive: true,
  },
];

async function run(): Promise<void> {
  await dataSource.initialize();
  console.log('Connected to database for YCT seed');

  const levelRepo = dataSource.getRepository(YctLevel);
  const lessonRepo = dataSource.getRepository(YctLesson);
  const vocabRepo = dataSource.getRepository(YctVocabulary);

  for (const lvl of YCT_LEVELS) {
    let level = await levelRepo.findOne({ where: { code: lvl.code } });
    if (!level) {
      level = levelRepo.create(lvl);
      await levelRepo.save(level);
      console.log(`Created ${lvl.code}`);
    } else {
      level.name = lvl.name;
      level.description = lvl.description;
      level.displayOrder = lvl.displayOrder;
      level.status = lvl.status;
      await levelRepo.save(level);
      console.log(`Updated ${lvl.code}`);
    }
  }

  // Seed sample lessons for YCT1
  const yct1 = await levelRepo.findOne({ where: { code: 'YCT1' } });
  if (yct1) {
    const existingLessons = await lessonRepo.count({ where: { levelId: yct1.id } });
    if (existingLessons === 0) {
      console.log('Seeding sample lessons & vocabs for YCT1...');
      
      const lesson1 = await lessonRepo.save(
        lessonRepo.create({
          levelId: yct1.id,
          title: 'Bài 1: Chào bạn! (你好)',
          description: 'Làm quen các câu chào hỏi và đại từ xưng hô đơn giản nhất.',
          displayOrder: 1,
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
        }),
      );

      const lesson2 = await lessonRepo.save(
        lessonRepo.create({
          levelId: yct1.id,
          title: 'Bài 2: Số đếm vui nhộn (一二三)',
          description: 'Học đếm từ 1 đến 10 qua các hình ảnh vui nhộn.',
          displayOrder: 2,
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
        }),
      );

      const lesson3 = await lessonRepo.save(
        lessonRepo.create({
          levelId: yct1.id,
          title: 'Bài 3: Động vật đáng yêu (动物)',
          description: 'Nhận biết các loài thú cưng và vật nuôi thân quen.',
          displayOrder: 3,
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
        }),
      );

      // Vocabs for Lesson 1
      const vocabs1 = [
        { hanzi: '你', pinyin: 'nǐ', meaningVi: 'bạn, con, cháu (ngôi thứ 2)', example: '你好！', partOfSpeech: 'đại từ', imageKey: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop' },
        { hanzi: '好', pinyin: 'hǎo', meaningVi: 'tốt, đẹp, hay', example: '很好！', partOfSpeech: 'tính từ', imageKey: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&auto=format&fit=crop' },
        { hanzi: '我', pinyin: 'wǒ', meaningVi: 'tôi, mình, tớ', example: '我是学生。', partOfSpeech: 'đại từ', imageKey: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=400&auto=format&fit=crop' },
        { hanzi: '再见', pinyin: 'zàijiàn', meaningVi: 'tạm biệt, hẹn gặp lại', example: '老师，再见！', partOfSpeech: 'động từ', imageKey: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop' },
        { hanzi: '谢谢', pinyin: 'xièxie', meaningVi: 'cảm ơn', example: '谢谢妈妈！', partOfSpeech: 'động từ', imageKey: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&auto=format&fit=crop' },
      ];

      for (const v of vocabs1) {
        await vocabRepo.save(vocabRepo.create({
          ...v,
          levelId: yct1.id,
          lessonId: lesson1.id,
          status: ContentStatus.PUBLISHED,
        }));
      }

      // Vocabs for Lesson 2
      const vocabs2 = [
        { hanzi: '一', pinyin: 'yī', meaningVi: 'số 1', example: '一个苹果', partOfSpeech: 'số từ', imageKey: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop' },
        { hanzi: '二', pinyin: 'èr', meaningVi: 'số 2', example: '两个人', partOfSpeech: 'số từ', imageKey: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop' },
        { hanzi: '三', pinyin: 'sān', meaningVi: 'số 3', example: '三只小狗', partOfSpeech: 'số từ', imageKey: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&auto=format&fit=crop' },
        { hanzi: '四', pinyin: 'sì', meaningVi: 'số 4', example: '四个本子', partOfSpeech: 'số từ', imageKey: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop' },
        { hanzi: '五', pinyin: 'wǔ', meaningVi: 'số 5', example: '五朵花', partOfSpeech: 'số từ', imageKey: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&auto=format&fit=crop' },
      ];

      for (const v of vocabs2) {
        await vocabRepo.save(vocabRepo.create({
          ...v,
          levelId: yct1.id,
          lessonId: lesson2.id,
          status: ContentStatus.PUBLISHED,
        }));
      }

      // Vocabs for Lesson 3
      const vocabs3 = [
        { hanzi: '猫', pinyin: 'māo', meaningVi: 'con mèo', example: '我家有一只小猫。', partOfSpeech: 'danh từ', imageKey: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop' },
        { hanzi: '狗', pinyin: 'gǒu', meaningVi: 'con chó', example: '小狗很可爱。', partOfSpeech: 'danh từ', imageKey: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop' },
        { hanzi: '鸟', pinyin: 'niǎo', meaningVi: 'con chim', example: '大树上有一只小鸟。', partOfSpeech: 'danh từ', imageKey: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&auto=format&fit=crop' },
        { hanzi: '鱼', pinyin: 'yú', meaningVi: 'con cá', example: '水里有很多鱼。', partOfSpeech: 'danh từ', imageKey: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&auto=format&fit=crop' },
      ];

      for (const v of vocabs3) {
        await vocabRepo.save(vocabRepo.create({
          ...v,
          levelId: yct1.id,
          lessonId: lesson3.id,
          status: ContentStatus.PUBLISHED,
        }));
      }

      console.log('Seeded sample lessons and vocabularies successfully.');
    }
  }

  await dataSource.destroy();
  console.log('YCT seed completed');
}

run().catch((err) => {
  console.error('YCT seed failed:', err);
  process.exit(1);
});
