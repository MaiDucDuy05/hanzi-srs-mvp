import { IsString, IsNotEmpty } from 'class-validator';

export class CheckSpellingDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
