/**
 * PubMed Service
 * Integração com NCBI E-Utilities para busca de artigos científicos.
 */

const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export interface PubMedArticle {
  id: string;
  title: string;
  authors: string[];
  source: string;
  pubDate: string;
  doi?: string;
  abstract?: string;
  url: string;
}

export const pubmedService = {
  /**
   * Busca artigos recentes baseados em uma query.
   */
  async searchArticles(query: string = 'nutrition science', retmax: number = 10): Promise<PubMedArticle[]> {
    try {
      // 1. Search for IDs
      const searchRes = await fetch(
        `${BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${retmax}&retmode=json&sort=relevance`
      );
      const searchData = await searchRes.json();
      const ids = searchData.esearchresult.idlist;

      if (!ids || ids.length === 0) return [];

      // 2. Fetch summaries for these IDs
      const summaryRes = await fetch(
        `${BASE_URL}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`
      );
      const summaryData = await summaryRes.json();
      
      const articles: PubMedArticle[] = ids.map((id: string) => {
        const item = summaryData.result[id];
        return {
          id: id,
          title: item.title,
          authors: item.authors?.map((a: any) => a.name) || [],
          source: item.source,
          pubDate: item.pubdate,
          doi: item.elocationid?.replace('doi: ', ''),
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
        };
      });

      return articles;
    } catch (error) {
      console.error('[PubMed Service] Search failed:', error);
      return [];
    }
  }
};
