import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vocabulary } from '../../curriculum/entities/vocabulary.entity';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

@Injectable()
export class CsvImportService {
  constructor(
    @InjectRepository(Vocabulary)
    private vocabRepository: Repository<Vocabulary>,
  ) {}

  async importVocabularies(file: Express.Multer.File, adminId: string): Promise<any> {
    if (!file) {
      throw new BadRequestException('File không tồn tại');
    }

    const results: any[] = [];
    const stream = Readable.from(file.buffer);

    return new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (data: any) => {
          // Normalize keys if needed (e.g. lowercase)
          const row = {
            hanzi: data['Hanzi'] || data['hanzi'],
            pinyin: data['Pinyin'] || data['pinyin'],
            meaning: data['Meaning'] || data['meaning'],
            vietnameseMeaning: data['VietnameseMeaning'] || data['vietnamese_meaning'] || data['Meaning'] || data['meaning'],
            exampleSentence: data['Example'] || data['example'],
            // mapping more fields as necessary
          };

          if (row.hanzi && row.pinyin && row.meaning) {
            results.push(row);
          }
        })
        .on('end', async () => {
          if (results.length === 0) {
            return reject(new BadRequestException('Không tìm thấy dữ liệu hợp lệ trong file CSV. Các cột cần thiết: Hanzi, Pinyin, Meaning.'));
          }

          try {
            // Bulk insert for simplicity
            const newVocabs = results.map(r => this.vocabRepository.create({
              hanzi: r.hanzi,
              pinyin: r.pinyin,
              meaningVi: r.vietnameseMeaning || r.meaning,
              // Check the actual entity properties if there's exampleSentence
              // exampleSentence: r.exampleSentence,
            }));
            
            await this.vocabRepository.save(newVocabs);
            resolve({ count: newVocabs.length });
          } catch (error) {
            console.error('Error saving imported vocabs:', error);
            reject(new BadRequestException('Lỗi khi lưu từ vựng vào CSDL'));
          }
        })
        .on('error', (error: Error) => {
          console.error('Error parsing CSV:', error);
          reject(new BadRequestException('Lỗi định dạng file CSV'));
        });
    });
  }
}
