import { t } from "elysia";

export const tUserId = t.String({ title: "UserId", pattern: "^User:[a-z0-9]{20}$" });
export const tCompanyId = t.String({ title: "CompanyId", pattern: "^Company:[a-z0-9]{20}$" });
export const tProjectId = t.String({ title: "ProjectId", pattern: "^Project:[a-z0-9]{20}$" });
export const tProductId = t.String({ title: "ProductId", pattern: "^Product:[a-z0-9]{20}$" });
export const tApplicationId = t.String({ title: "ApplicationId", pattern: "^Application:[a-z0-9]{20}$" });
export const tFeatureId = t.String({ title: "FeatureId", pattern: "^Feature:[a-z0-9]{20}$" });
export const tComponentId = t.String({ title: "ComponentId", pattern: "^Component:[a-z0-9]{20}$" });
export const tBugId = t.String({ title: "BugId", pattern: "^Bug:[a-z0-9]{20}$" });
export const tChannelId = t.String({ title: "ChannelId", pattern: "^Channel:[a-z0-9]{20}$" });
export const tLabelId = t.String({ title: "LabelId", pattern: "^Label:[a-z0-9]{20}$" });
export const tMessageId = t.String({ title: "MessageId", pattern: "^Message:[a-z0-9]{20}$" });
export const tTaskId = t.String({ title: "TaskId", pattern: "^Task:[a-z0-9]{20}$" });
export const tObjectiveId = t.String({ title: "ObjectiveId", pattern: "^Objective:[a-z0-9]{20}$" });
export const tStatusId = t.String({ title: "StatusId", pattern: "^Status:[a-z0-9]{20}$" });
export const tToDoId = t.String({ title: "ToDoId", pattern: "^ToDo:[a-z0-9]{20}$" });
export const tReleaseId = t.String({ title: "ReleaseId", pattern: "^Release:[a-z0-9]{20}$" });
export const tRepositoryId = t.String({ title: "RepositoryId", pattern: "^Repository:[a-z0-9]{20}$" });
export const tMergeRequestId = t.String({ title: "MergeRequestId", pattern: "^MergeRequest:[a-z0-9]{20}$" });

export const tValues = t.Union([t.Literal("Low"), t.Literal("Medium"), t.Literal("High")], { default: "Medium" });
export const tPriorities = t.Union([t.Literal("Low"), t.Literal("Medium"), t.Literal("High"), t.Literal("Urgent")], { default: "Medium" });
export const tColors = t.Union([t.Literal("Orange/Light"), t.Literal("Green/Light"), t.Literal("Purple/Light"), t.Literal("Red/Light")], { default: "Green/Light" });
export const tEfforts = t.Union([t.Literal("Hour"), t.Literal("Hours"), t.Literal("Day"), t.Literal("Days"), t.Literal("Week")], { default: "White" });

export const tCompany = t.Any();

export const tUserPost = t.Object({
	full_name: t.String(),
	email: t.String({ format: "email" }),
	handle: t.Optional(t.String({ minLength: 3, maxLength: 64 })),
});

export const tUser = t.Object({
	id: tUserId,
	full_name: t.String(),
	handle: t.String(),
	email: t.String({ format: "email" }),
	pinned: t.Array(t.String()),
	color: tColors,
});

export const tObjective = t.Object({
	id: tObjectiveId,
	title: t.String({ minLength: 3, maxLength: 64 }),
	description: t.String({ maxLength: 8192 }),
	active: t.Boolean(),
});

export const tTeamPost = t.Object({
	name: t.String({ minLength: 3, maxLength: 64 }),
	description: t.String({ maxLength: 8192 }),
	lead: t.Optional(tUserId),
	color: t.Optional(tColors),
	icon: t.Optional(t.String({ minLength: 1, maxLength: 4 })),
});

export const tTeamId = t.String();

export const tTeam = t.Object({
	id: tTeamId,
	name: t.String({ minLength: 3, maxLength: 64 }),
	icon: t.Nullable(t.String()),
	members: t.Array(t.Object({
		id: tUserId,
	})),
});

export const tMember = t.Object({
	user: t.String(),
});

export const tRole = t.Object({
	name: t.String(),
});

export const tChannelPost = t.Object({
	name: t.String({ minLength: 3, maxLength: 64}),
});

export const tChannel = t.Object({
	id: tChannelId,
	name: t.Optional(t.String({ minLength: 3, maxLength: 64})),
	subscribers: t.Array(tUserId),
});

export const tMessagePost = t.Object({
	body: t.String({ minLength: 1, maxLength: 8192, }),
	is_inquiry: t.Boolean({ default: false }),
});

export const tMessage = t.Object({
	id: tMessageId,
	body: t.String({ minLength: 1, maxLength: 8192, }),
	author: t.Object({
		id: tUserId,
	}),
	date: t.Date(),
	resolved: t.Optional(t.Boolean()),
	question: t.Optional(tMessageId),
});

export const tTaskPost = t.Object({
	title: t.String({ minLength: 3, maxLength: 64 }),
	body: t.String({ maxLength: 8192 }),
	priority: t.Nullable(tPriorities),
	effort: t.Nullable(tEfforts),
	value: t.Nullable(tValues),
	status: t.Nullable(tStatusId),
	assignee: t.Nullable(tUserId),
}, { title: "Task" });

export const tTaskUpdatePost = t.Object({
	value: t.Number({ minimum: 0, maximum: 100 }),
	// The time spent in minutes
	time_spent: t.Number({ minimum: 0 }),
	note: t.String({ maxLength: 8192 }),
});

export const tTask = t.Object({
	id: tTaskId,
	title: t.String({ minLength: 3, maxLength: 64 }),
	body: t.String({ maxLength: 8192 }),
	status: t.Object({
		id: tStatusId,
		closed_as: t.Optional(t.Union([t.Literal("Resolved")])),
		note: t.Optional(t.String({ maxLength: 8192 })),
	}),
	priority: tPriorities,
	effort: tEfforts,
	value: tValues,
	progress: t.Number({ minimum: 0, maximum: 100 }),
	labels: t.Array(t.Object({
		id: tLabelId,
	})),
	assignee: t.Nullable(t.Object({
		id: tUserId,
	})),
	updates: t.Array(t.Object({
		date: t.Date(),
		value: t.Number({ minimum: 0, maximum: 100 }),
		note: t.String({ maxLength: 8192 }),
	})),
}, { title: "Task" });

// relatives: t.Object({
// 	children: t.Array(t.Object({ id: tTaskId })),
// 	related: t.Array(t.Object({ id: tTaskId })),
// 	blockers: t.Array(t.Object({ id: tTaskId })),
// }),

export const tMergeRequest = t.Object({
	title: t.String({ minLength: 3, maxLength: 64 }),
});

export const tProjectPost = t.Object({
	name: t.String({ minLength: 3, maxLength: 64 }),
	description: t.String({ minLength: 0, maxLength: 8192, default: "" }),
	lead: t.Nullable(tUserId),
	members: t.Array(tUserId, { default: [] }),
	client: t.Optional(tCompany, false),
	end: t.Nullable(t.Date()),
});

export const tMilestone = t.Object({
	title: t.String({ minLength: 3, maxLength: 64 }),
	description: t.String({ minLength: 0, maxLength: 8192 }),
	end: t.Optional(t.Date()),
});

export const tProject = t.Object({
	id: t.String(),
	name: t.String({ minLength: 3, maxLength: 64 }),
	description: t.String({ minLength: 0, maxLength: 8192 }),
	lead: t.Nullable(t.Object({ id: tUserId })),
	members: t.Array(tUserId),
	client: t.Optional(tCompany),
	end: t.Nullable(t.Date()),
	milestones: t.Array(tMilestone),
	status: t.Object({
		id: tStatusId,
	}),
	updates: t.Array(t.Object({
		title: t.String({ minLength: 3, maxLength: 128 }),
		body: t.String({ maxLength: 8192 }),
	})),
});

export const tBugPost = t.Object({
	title: t.String({ minLength: 3, maxLength: 64 }),
	description: t.String({ maxLength: 8192 }),
});

export const tBug = t.Object({
	id: tBugId,
	title: t.String({ minLength: 3, maxLength: 64 }),
	description: t.String({ maxLength: 8192 }),
	resolved: t.Boolean(),
	created: t.Date(),
	impact: t.Object({
		features: t.Array(t.Object({
			id: tFeatureId
		})),
		applications: t.Array(t.Object({
			id: tApplicationId
		})),
	}),
	release: t.Nullable(t.Object({
		id: t.String(),
	})),
});

export const tRelease = t.Object({
	id: tReleaseId,
	name: t.String({ minLength: 3, maxLength: 64 }),
	description: t.String({ maxLength: 8192 }),
});

export const tRepositoryPost = t.Object({
	name: t.String({ minLength: 3, maxLength: 64 }),
});

export const tRepository = t.Object({
	id: tRepositoryId,
	name: t.String({ minLength: 3, maxLength: 64 }),
	url: t.String({ minLength: 3, maxLength: 64 }),
	provider: t.Union([t.Literal("GitHub")]),
	branches: t.Array(t.Object({
		name: t.String({ minLength: 3, maxLength: 64 }),
	})),
});

export const tFeaturePost = t.Object({
	name: t.String({ minLength: 3, maxLength: 64 }),
	description: t.String({ maxLength: 8192 }),
	value: tValues,
});

export const tFeature = t.Object({
	id: tFeatureId,
	name: t.String({ minLength: 3, maxLength: 64 }),
	description: t.String({ maxLength: 8192 }),
	value: tValues,
});

export const tComponent = t.Object({
	id: tComponentId,
	name: t.String({ minLength: 3, maxLength: 64 }),
	description: t.String({ maxLength: 8192 }),
});

export const tState = t.Object({
	value: t.String({ minLength: 3, maxLength: 64 }),
});

export const tStatusPost = t.Object({
	state: t.Union([t.Literal("Backlog"), t.Literal("Alive"), t.Literal("Resolved")]),
	name: t.String({ minLength: 3, maxLength: 64 }),
});

export const tStatus = t.Object({
	id: tStatusId,
	state: t.Union([t.Literal("Backlog"), t.Literal("Alive"), t.Literal("Resolved")]),
	name: t.String({ minLength: 3, maxLength: 64 }),
});

export const tLabelPost = t.Object({
	title: t.String({ minLength: 3, maxLength: 64 }),
	color: tColors,
	icon: t.Nullable(t.String({ minLength: 1, maxLength: 4 })),
});

export const tLabel = t.Object({
	id: tLabelId,
	title: t.String({ minLength: 3, maxLength: 64 }),
	color: tColors,
	icon: t.Nullable(t.String({ minLength: 1, maxLength: 4 })),
});

export const tComparison = t.Union([t.Literal("="), t.Literal("<"), t.Literal("<="), t.Literal(">"), t.Literal(">="), t.Literal("!="), t.Literal("IN"), t.Literal("NOT IN")]);

export const tStateFilter = t.Object({
	type: t.Literal("State"),
	operation: tComparison,
	value: tState,
});

export const tStatusFilter = t.Object({
	type: t.Literal("Status"),
	operation: tComparison,
	value: tStatusId,
});

export const tAssigneeFilter = t.Object({
	type: t.Literal("Assignee"),
	operation: tComparison,
	value: tUserId,
});

export const tCreatorFilter = t.Object({
	type: t.Literal("Creator"),
	operation: tComparison,
	value: tUserId,
});

export const tPriorityFilter = t.Object({
	type: t.Literal("Priority"),
	operation: tComparison,
	value: t.String(),
});

export const tEffortFilter = t.Object({
	type: t.Literal("Effort"),
	operation: tComparison,
	value: t.String(),
});

export const tValueFilter = t.Object({
	type: t.Literal("Value"),
	operation: tComparison,
	value: t.String(),
});

export const tLabelFilter = t.Object({
	type: t.Literal("Label"),
	operation: tComparison,
	value: tLabelId,
});

export const tTextFilter = t.Object({
	type: t.Literal("Text"),
	value: t.String({ maxLength: 128 }),
});

export const tAgeFilter = t.Object({
	type: t.Literal("Age"),
	value: t.String({ maxLength: 128 }),
});

export const tFilter = t.Union([tStateFilter, tStatusFilter, tAssigneeFilter, tCreatorFilter, tPriorityFilter, tEffortFilter, tValueFilter, tLabelFilter, tTextFilter, tAgeFilter]);

export const tViewPost = t.Object({
	name: t.String({ minLengt: 3, maxLength: 64 }),
	filters: t.Array(tFilter),
});

export const tViewId = t.String();

export const tView = t.Object({
	id: tViewId,
	name: t.String({ minLengt: 3, maxLength: 64 }),
	filters: t.Array(tFilter),
}, { title: "View" });

export const tProductPost = t.Object({
	name: t.String({ minLength: 3, maxLength: 64 }),
	description: t.String({ maxLength: 8192 }),
});

export const tProduct = t.Object({
	id: tProductId,
	name: t.String({ minLength: 3, maxLength: 64 }),
	description: t.String({ maxLength: 8192 }),
});

export const tToDoPost = t.Object({
	title: t.Nullable(t.String({ minLength: 3, maxLength: 64 })),
	related: t.Optional(t.String()),
	tag: t.Optional(t.String()),
});

export const tToDo = t.Object({
	id: tToDoId,
	title: t.String({ minLength: 3, maxLength: 64 }),
	owner: tUserId,
	done: t.Boolean(),
	due: t.Nullable(t.Date()),
});

export const tApplicationPost = t.Object({
	name: t.String({ minLength: 3, maxLength: 64 }),
	description: t.String({ maxLength: 8192 }),
});

export const tApplication = t.Object({
	id: tApplicationId,
	name: t.String({ minLength: 3, maxLength: 64 }),
	description: t.String({ maxLength: 8192 }),
	repository: t.Nullable(t.Object({ id: tRepositoryId })),
});

export const tGithubOrganizationIntegration = t.Object({

});

export const tKimaiOrganizationIntegration = t.Object({

});

export const tPoly = t.Intersect([
	t.Object({
		type: t.Literal("Task"),
		object: tTask,
	}),
	t.Object({
		type: t.Literal("Project"),
		object: tProject,
	}),
	t.Object({
		type: t.Literal("Team"),
		object: tTeam,
	}),
	t.Object({
		type: t.Literal("Channel"),
		object: tChannel,
	}),
	t.Object({
		type: t.Literal("Product"),
		object: tProduct,
	}),
	t.Object({
		type: t.Literal("Bug"),
		object: tBug,
	}),
	t.Object({
		type: t.Literal("Feature"),
		object: tFeature,
	}),
	t.Object({
		type: t.Literal("Label"),
		object: tLabel,
	}),
	t.Object({
		type: t.Literal("Message"),
		object: tMember,
	}),
	t.Object({
		type: t.Literal("Repository"),
		object: tRepository,
	}),
	t.Object({
		type: t.Literal("MergeRequest"),
		object: tMergeRequest,
	}),
	t.Object({
		type: t.Literal("User"),
		object: tUser,
	}),
]);
