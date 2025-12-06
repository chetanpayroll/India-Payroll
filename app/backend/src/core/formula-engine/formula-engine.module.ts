import { Module } from '@nestjs/common';
import { FormulaEngineService } from './formula-engine.service';

@Module({
    providers: [FormulaEngineService],
    exports: [FormulaEngineService],
})
export class FormulaEngineModule { }
