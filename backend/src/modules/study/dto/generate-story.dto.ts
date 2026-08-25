import { IsArray, IsString, IsNotEmpty } from 'class-validator';

export class GenerateStoryDto {
  @IsArray()
  @IsString({ each: true })
  words: string[];

  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsString()
  @IsNotEmpty()
  level: string;
}
