import { BoardArticleCategory, BoardArticleStatus } from '../../enums/board-article.enum';
import { Direction } from '../../enums/common.enum';

export interface BoardArticlesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: BAISearch;
}

export interface BAISearch {
	articleCategory?: BoardArticleCategory;
	text?: string;
	memberId?: string;
}

export interface AllBoardArticlesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: ABAISearch;
}

export interface ABAISearch {
	articleStatus?: BoardArticleStatus;
	articleCategory?: BoardArticleCategory;
}

export interface BoardArticleInput {
	articleCategory: BoardArticleCategory;
	articleTitle: string;
	articleContent: string;
	articleImage?: string;
}
