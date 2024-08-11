import type { RecordId } from "surrealdb";

export type Role = {
	name: string,
};

export type UserId = RecordId<"User">;
export type BugId = RecordId<"Bug">;
export type FeatureId = RecordId<"Feature">;
export type ReleaseId = RecordId<"Release">;
export type MessageId = RecordId<"Message">;
export type LabelId = RecordId<"Label">;
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
	id?: UserId,
	full_name: string,
	email: string,
	handle: string,
};

export type Colors = "Orange/Light";

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
};

export type Task = {
	id: TaskId,
	title: string,
	body: string,

	created: Date,

	labels: LabelId[],

	assignee: UserId | null,

	status: StatusId,

	priority: Priorities,
	effort: Efforts,
	
	value: Value,
};

export type Cycle = {

};

export type Operation = "=" | "<" | "<=" | ">" | ">=" | "!=";

export type Filter = {
	type: "Project",
	operation: Operation,
	value: ProjectId,
} | {
	type: "State",
	operation: Operation,
	value: State,
} | {
	type: "Status",
	operation: Operation,
	value: Status,
} | {
	type: "Assignee",
	operation: Operation,
	value: UserId,
} | {
	type: "Creator",
	operation: Operation,
	value: UserId,
} | {
	type: "Priority",
	operation: Operation,
	value: Priorities,
} | {
	type: "Effort",
	operation: Operation,
	value: Efforts,
} | {
	type: "Value",
	operation: Operation,
	value: Value,
} | {
	type: "Label",
	operation: "=" | "!=",
	value: LabelId,
} | {
	type: "Text",
	value: string,
};

export type View = {
	id?: ViewId,
	name: string,
	// creator: UserId,
	filters: Filter[],
	// group_by: never,
	// order_by: never,
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

export type Views = "List" | "Kanban" | "Graph" | "Gantt";

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
	id?: TeamId,
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