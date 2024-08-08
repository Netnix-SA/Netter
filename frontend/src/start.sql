DEFINE ANALYZER organization_analyzer TOKENIZERS blank, class FILTERS lowercase, snowball(english);
DEFINE ANALYZER title_analyzer TOKENIZERS blank, class FILTERS lowercase, edgengram(2,9);

DEFINE INDEX user_name ON User FIELDS full_name SEARCH ANALYZER title_analyzer BM25;
DEFINE INDEX product_name ON Product FIELDS name SEARCH ANALYZER title_analyzer BM25;
DEFINE INDEX project_name ON Project FIELDS name SEARCH ANALYZER title_analyzer BM25;
DEFINE INDEX channel_name ON Channel FIELDS name SEARCH ANALYZER title_analyzer BM25;
DEFINE INDEX team_name ON Team FIELDS name SEARCH ANALYZER title_analyzer BM25;
DEFINE INDEX task_title ON Task FIELDS title SEARCH ANALYZER title_analyzer BM25;
DEFINE INDEX bug_title ON Bug FIELDS title SEARCH ANALYZER title_analyzer BM25;
DEFINE INDEX bug_description ON Bug FIELDS description SEARCH ANALYZER organization_analyzer BM25;