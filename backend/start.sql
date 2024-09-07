DEFINE TABLE User;
DEFINE TABLE ToDo;
DEFINE TABLE Product;
DEFINE TABLE Channel;
DEFINE TABLE Team;
DEFINE TABLE Message;
DEFINE TABLE Organization;
DEFINE TABLE Label;
DEFINE TABLE Bug;
DEFINE TABLE Feature;
DEFINE TABLE Status;
DEFINE TABLE Project;
DEFINE TABLE Objective;
DEFINE TABLE View;
DEFINE TABLE Task;

DEFINE TABLE impacts TYPE RELATION; -- Bug impacts Feature
DEFINE TABLE needs TYPE RELATION; -- Feature needs Component
DEFINE TABLE mentions TYPE RELATION; -- Message mentions *
DEFINE TABLE slated TYPE RELATION; -- Feature slated for Objective
DEFINE TABLE tackles TYPE RELATION; -- Task tackles Feature | Bug
DEFINE TABLE related TYPE RELATION; -- Task is related to *
DEFINE TABLE requires TYPE RELATION; -- Task requires Task
DEFINE TABLE blocks TYPE RELATION; -- Task blocks Task

DEFINE ANALYZER title_analyzer TOKENIZERS blank, class FILTERS lowercase, edgengram(1,16);
DEFINE ANALYZER body_analyzer TOKENIZERS blank, class FILTERS lowercase, snowball(english);

DEFINE INDEX user_name ON User FIELDS full_name SEARCH ANALYZER title_analyzer BM25;
DEFINE INDEX product_name ON Product FIELDS name SEARCH ANALYZER title_analyzer BM25;
DEFINE INDEX project_name ON Project FIELDS name SEARCH ANALYZER title_analyzer BM25;
DEFINE INDEX channel_name ON Channel FIELDS name SEARCH ANALYZER title_analyzer BM25;
DEFINE INDEX team_name ON Team FIELDS name SEARCH ANALYZER title_analyzer BM25;
DEFINE INDEX task_title ON Task FIELDS title SEARCH ANALYZER title_analyzer BM25;
DEFINE INDEX bug_title ON Bug FIELDS title SEARCH ANALYZER title_analyzer BM25;
DEFINE INDEX bug_description ON Bug FIELDS description SEARCH ANALYZER body_analyzer BM25;
DEFINE INDEX feature_title ON Feature FIELDS name SEARCH ANALYZER title_analyzer BM25;
DEFINE INDEX feature_description ON Feature FIELDS description SEARCH ANALYZER body_analyzer BM25;
DEFINE INDEX component_name ON Component FIELDS name SEARCH ANALYZER title_analyzer BM25;
DEFINE INDEX component_description ON Component FIELDS description SEARCH ANALYZER body_analyzer BM25;

DEFINE INDEX user_handle ON TABLE User COLUMNS handle;
DEFINE INDEX message_author ON TABLE Message COLUMNS author;
DEFINE INDEX message_channel ON TABLE Message COLUMNS channel;
DEFINE INDEX message_user_inquiries ON TABLE Message COLUMNS author, resolved;
DEFINE INDEX task_belongs_to ON TABLE Task COLUMNS belongs_to; -- Index for filtering tasks by project
DEFINE INDEX feature_product ON TABLE Feature COLUMNS product; -- Index for filtering tasks by products