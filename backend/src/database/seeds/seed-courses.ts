import dataSource from '../data-source';
import { Course } from '../../modules/courses/entities/course.entity';
import { CourseLesson } from '../../modules/courses/entities/course-lesson.entity';
import { Lesson } from '../../modules/curriculum/entities/lesson.entity';
import { Audience, ContentStatus } from '../../common/enums/curriculum.enums';

/**
 * 2 khoá học mẫu: người lớn & thiếu nhi.
 * Liên kết lesson bằng cách match title (ví dụ: "Bài X:")
 */
type CourseDef = {
  name: string; slug: string; audience: Audience;
  desc: string; displayOrder: number;
  lessonTitles: RegExp[]; // regex match title bài học
};

const COURSES: CourseDef[] = [
  {
    name: 'Hán tự giao tiếp cơ bản (Người lớn)', slug: 'hanzi-giao-tiep-co-ban-nguoi-lon',
    audience: Audience.ADULT, displayOrder: 1,
    desc: 'Lộ trình HSK1-HSK3 cho người trưởng thành muốn giao tiếp du lịch & công việc.',
    lessonTitles: [/Bài [1234567]:/], // lấy tất cả 7 bài đầu
  },
  {
    name: 'Hán tự vui vẻ cùng bé (Thiếu nhi)', slug: 'hanzi-vui-ve-cung-be-thieu-nhi',
    audience: Audience.CHILD, displayOrder: 2,
    desc: 'Từ vựng hình ảnh, chủ đề quen thuộc — gia đình, đồ ăn, bạn bè cho trẻ 6-12 tuổi.',
    lessonTitles: [/Bài [135]:/], // 3 bài nhẹ nhàng
  },
];

async function run(): Promise<void> {
  await dataSource.initialize();
  const courseRepo = dataSource.getRepository(Course);
  const clRepo     = dataSource.getRepository(CourseLesson);
  const lesRepo    = dataSource.getRepository(Lesson);
  const allLessons = await lesRepo.find();

  for (let i = 0; i < COURSES.length; i++) {
    const C = COURSES[i];
    let course = await courseRepo.findOne({ where: { slug: C.slug } });
    if (!course) {
      course = await courseRepo.save({
        name: C.name, slug: C.slug, description: C.desc, audience: C.audience,
        status: ContentStatus.PUBLISHED, displayOrder: C.displayOrder,
      });
      console.log(`+ Course: ${C.name} (${C.audience})`);
    } else {
      console.log(`= Course exists: ${C.name}`);
    }
    // Liên kết các lesson match regex
    const matched = allLessons.filter(L => C.lessonTitles.some(r => r.test(L.title)));
    let order = 1;
    for (const L of matched) {
      const has = await clRepo.findOne({ where: { courseId: course.id, lessonId: L.id } });
      if (!has) await clRepo.save({ courseId: course.id, lessonId: L.id, displayOrder: order++ });
    }
    console.log(`  → ${matched.length} lessons linked`);
  }

  await dataSource.destroy();
  console.log('✅ seed-courses completed');
}
run().catch(err => { console.error('❌ seed-courses failed:', err); process.exit(1); });