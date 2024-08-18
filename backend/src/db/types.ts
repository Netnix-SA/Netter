import type { RecordId, StringRecordId } from "surrealdb";

export type UserId = RecordId<"User">;
export type BugId = RecordId<"Bug">;
export type FeatureId = RecordId<"Feature">;
export type ReleaseId = RecordId<"Release">;
export type MessageId = RecordId<"Message">;
export type LabelId = RecordId<"Label">;
export type ObjectiveId = RecordId<"Objective">;
export type TaskId = RecordId<"Task">;
export type StatusId = RecordId<"Status">;
export type ViewId = RecordId<"View">;
export type ChannelId = RecordId<"Channel">;
export type ProjectId = RecordId<"Project">;
export type ApplicationId = RecordId<"Application">;
export type ProductId = RecordId<"Product">;
export type RepositoryId = RecordId<"Repository">;
export type TeamId = RecordId<"Team">;
export type ToDoId = RecordId<"ToDo">;

export type User = {
	id: UserId,
	full_name: string,
	email: string,
	handle: string,
	color: Colors,
	pinned: StringRecordId[],
};

export type Role = {
	name: string,
};

export type Colors =
	| "Orange/Light" | "Orange/Dark"
	| "Green/Light"  | "Green/Dark" 
	| "Red/Light"    | "Red/Dark"
	| "Blue/Light"   | "Blue/Dark"
	| "Purple/Light" | "Purple/Dark"
	| "Gray/Light"   | "Gray/Dark"
;

// A label is an arbitrary tag that can be put on objects
export type Label = {
	id: LabelId,
	title: string,
	description: string,
	color: Colors,
	icon: string | null,
};

export type State = "Backlog" | "Alive" | "Resolved";

export type Status = {
	id: StatusId,
	name: string,
	state: State,
	color: string,
	icon: string,
	position: {
		i: number,
	},
};

export type Task = {
	id: TaskId,
	title: string,
	body: string,
	created: Date,

	labels: LabelId[],

	assignee: UserId | null,

	status: StatusId,

	updates: {
		date: Date,
		note: string,
		// The time spent in minutes
		time_spent: number,
		value: number,
	}[],

	priority: Priorities,
	effort: Efforts,
	value: Value,
	objective: ObjectiveId | null,
};

export type Objective = {
	id: ObjectiveId,
	title: string,
	description: string,
	end: Date | null,
};

export type Views = "List" | "Kanban" | "Graph" | "Gantt";
export type OperationEq = "=" | "!=";
export type OperationCmp = "<" | "<=" | ">" | ">=";
export type OperationSet = "IN" | "NOT IN";
export type Operation = OperationEq | OperationCmp | OperationSet;

export type ProjectFilter = {
	type: "Project",
	operation: OperationEq,
	value: ProjectId,
};

export type TeamFilter = {
	type: "Team",
	operation: OperationEq,
	value: TeamId,
};

export type ObjectiveFilter = {
	type: "Objective",
	operation: OperationEq,
	value: ObjectiveId | null,
};

export type ApplicationFilter = {
	type: "Application",
	operation: OperationEq,
	value: ApplicationId,
};

export type StateFilter = {
	type: "State",
	operation: OperationEq,
	value: State,
};

export type StatusFilter = {
	type: "Status",
	operation: OperationEq,
	value: Status,
};

export type AssigneeFilter = {
	type: "Assignee",
	operation: OperationEq,
	value: UserId | null,
};

export type OwnerFilter = {
	type: "Creator",
	operation: OperationEq,
	value: UserId,
};

export type PriorityFilter = {
	type: "Priority",
	operation: OperationEq | OperationCmp,
	value: Priorities,
};

export type EffortFilter = {
	type: "Effort",
	operation: OperationEq | OperationCmp,
	value: Efforts,
};

export type ValueFilter = {
	type: "Value",
	operation: OperationEq | OperationCmp,
	value: Value,
};

export type LabelFilter = {
	type: "Label",
	operation: OperationEq,
	value: LabelId,
};

export type TextFilter = {
	type: "Text",
	operation: OperationSet,
	value: string,
};

export type Filter = ProjectFilter | TeamFilter | ApplicationFilter | StateFilter | StatusFilter | AssigneeFilter | OwnerFilter | PriorityFilter | EffortFilter | ValueFilter | LabelFilter | TextFilter;

export type View = {
	id: ViewId,
	name: string,
	filters: Filter[],
	type: {
		type: "Task",
		default: Views,
	} | {
		type: "Bug",
		default: "List" | "Graph",
	},
	belongs_to: UserId | TeamId | ProjectId,
};

export type Channel = {
	id: ChannelId,
	name: string,

	// Subscribers are users who wish to be notified about activity under this channel
	subscribers: { user: UserId }[],
};

export type Message = {
	id: MessageId,
	channel: ChannelId,
	body: string,
	author: UserId,
	date: Date,
	question: MessageId | undefined,
	resolved: boolean | undefined,
};

// A known issue in an application
export type Bug = {
	id: BugId,
	title: string,
	description: string,

	// The features this bug impacts on
	features: FeatureId[],

	// The application this bug is in
	applications: ApplicationId[],

	resolved: boolean,

	created: Date,

	release: ReleaseId | null,
};

export type Value = "Low" | "Medium" | "High";
export type Efforts = "Hour" | "Hours" | "Day" | "Days" | "Week";
export type Priorities = "Low" | "Medium" | "High" | "Urgent";

export type Company = {
	name: string,
};

export type Project = {
	id: ProjectId,
	name: string,
	description: string,
	lead: UserId | null,

	members: User[],

	milestones: Milestone[],
	objectives: { id: ObjectiveId }[],

	client: Company | null,

	end: Date | null,
};

// An update to a Task
export type Update = {
	// A description of the update
	description: string,
	// The new completion status out of 100
	completion?: number,
};

// An application exists under a project represent a single executable process
export type Application = {
	id: ApplicationId,
	name: string,
	description: string,
	repository: RepositoryId | null,
};

export type Product = {
	id: ProductId,
	name: string,
	description: string,

	applications: {
		id: ApplicationId,
	}[],
};

export type Feature = {
	id: FeatureId,
	name: string,
	description: string,
};

export type Repository = {
	id: RepositoryId,
	name: string,
	url: string,

	branches: {
		name: string,
	}[],
};

export type MergeRequest = {
	title: string,

	// actionables: (Task | Bug)[],
};

export type Comment = {
	owner: User,
	body: string,
};

export type Team = {
	id: TeamId,
	name: string,
	description: string,

	color: string,
	icon: string | null,

	lead: UserId,

	members: UserId[],
	teams: Team[],
};

// A todo is a reminder of some task created by users for themselves
export type ToDo = {
	id: ToDoId,
	title: string,
	url: string,
	due: Date,
	owner: UserId,
	done: boolean,
};

// A milestone represent a point in a project where some target are expected to be achived.
export type Milestone = {
	title: string,
	description: string,
};

export type Release = {
	// The name of the release, e.g: v1.8
	name: string,

	// The features included in the release
	features: Feature[],
};

// The organization is the owner/tenant of an instance of Netter
export type Organization = {
	// If null any domain is allowed.
	allowed_domains: string[] | null,

	integrations: Integration[],
};

export type Integration = GitHubIntegration | KimaiIntegration | SharePointIntegration;

export type GitHubIntegration = {
	type: "GitHub",
	installation_id: number,
};

export type KimaiIntegration = {
	type: "Kimai",
};

export type SharePointIntegration = {
	type: "SharePoint",
};