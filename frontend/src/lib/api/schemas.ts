import { t } from "elysia";

export const tUserId = t.String({ title: "UserId" });
export const tCompanyId = t.String({ title: "UserId" });
export const tApplicationId = t.String({ title: "ApplicationId" });
export const tFeatureId = t.String({ title: "FeatureId" });
export const tBugId = t.String({ title: "BugId" });
export const tChannelId = t.String({ title: "ChannelId" });
export const tLabelId = t.String();
export const tMessageId = t.String();
export const tTaskId = t.String();
export const tStatusId = t.String();
export const tRepositoryId = t.String();
export const tToDoId = t.String();

export const tPriorities = t.Union([t.Literal("Low"), t.Literal("Medium"), t.Literal("High"), t.Literal("Urgent")], { default: "Medium" });
export const tColors = t.Union([t.Literal("Orange/Light")], { default: "White" });
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
	name: t.String({ minLength: 3, maxLength: 64}),
	subscribers: t.Array(tUserId),
});

export const tMessagePost = t.Object({
	body: t.String({ minLength: 1, maxLength: 8192, }),
});

export const tMessage = t.Object({
	id: tMessageId,
	body: t.String({ minLength: 1, maxLength: 8192, }),
	author: t.Object({
		id: tUserId,
	}),
	date: t.Date(),
});

export const tTaskPost = t.Object({
	title: t.String({ minLength: 3, maxLength: 64 }),
	status: t.Optional(tStatusId),
}, { title: "Task" });

export const tTask = t.Object({
	id: tTaskId,
	title: t.String({ minLength: 3, maxLength: 64 }),
	body: t.String({ maxLength: 8192 }),
	status: tStatusId,
	priority: tPriorities,
	effort: tEfforts,
	labels: t.Array(t.Object({
		id: tLabelId,
	})),
	assignee: t.Nullable(t.Object({
		id: tUserId,
	})),
	relatives: t.Object({
		children: t.Array(t.Object({ id: tTaskId })),
		related: t.Array(t.Object({ id: tTaskId })),
		blockers: t.Array(t.Object({ id: tTaskId })),
	}),
	channel: t.Object({
		id: tChannelId,
	}),
}, { title: "Task" });

export const tMergeRequest = t.Object({
	title: t.String({ minLength: 3, maxLength: 64 }),
});

export const tProjectPost = t.Object({
	name: t.String({ minLength: 3, maxLength: 64 }),
	description: t.String({ minLength: 0, maxLength: 8192 }),
	lead: t.Optional(tUserId),
	members: t.Array(tUserId, { default: [] }),
	client: t.Optional(tCompany),
	end: t.Optional(t.Date()),
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
});

export const tBugPost = t.Object({
	title: t.String({ minLength: 3, maxLength: 64 }),
	description: t.String({ maxLength: 8192 }),
});

export const tBug = t.Object({
	id: tBugId,
	title: t.String({ minLength: 3, maxLength: 64 }),
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
	branches: t.Array(t.String({ minLength: 3, maxLength: 64 })),
});

export const tFeaturePost = t.Object({
	name: t.String({ minLength: 3, maxLength: 64 }),
	description: t.String({ maxLength: 8192 }),
});

export const tFeature = t.Object({
	id: tFeatureId,
	name: t.String({ minLength: 3, maxLength: 64 }),
	description: t.String({ maxLength: 8192 }),
});

export const tState = t.Object({
	value: t.String({ minLength: 3, maxLength: 64 }),
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

export const tComparison = t.Union([t.Literal("="), t.Literal("<"), t.Literal("<="), t.Literal(">"), t.Literal(">="), t.Literal("!=")]);

export const tStateFilter = t.Object({
	type: t.Literal("State"),
	comparator: tComparison,
	value: tState,
});

export const tStatusFilter = t.Object({
	type: t.Literal("Status"),
	comparator: tComparison,
	value: tStatus,
});

export const tAssigneeFilter = t.Object({
	type: t.Literal("Assignee"),
	comparator: tComparison,
	value: tUserId,
});

export const tCreatorFilter = t.Object({
	type: t.Literal("Creator"),
	comparator: tComparison,
	value: tUserId,
});

export const tPriorityFilter = t.Object({
	type: t.Literal("Priority"),
	comparator: tComparison,
	value: t.String(),
});

export const tEffortFilter = t.Object({
	type: t.Literal("Effort"),
	comparator: tComparison,
	value: t.String(),
});

export const tValueFilter = t.Object({
	type: t.Literal("Value"),
	comparator: tComparison,
	value: t.String(),
});

export const tLabelFilter = t.Object({
	type: t.Literal("Label"),
	comparator: tComparison,
	value: tLabel,
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
	id: tApplicationId,
	name: t.String({ minLength: 3, maxLength: 64 }),
	description: t.String({ maxLength: 8192 }),
});

export const tToDo = t.Object({
	id: tToDoId,
	title: t.Nullable(t.String({ minLength: 3, maxLength: 64 })),
	url: t.Nullable(t.String({ minLength: 3, maxLength: 64 })),
	owner: tUserId,
	done: t.Boolean(),
	due: t.Date(),
});

export const tApplicationPost = t.Object({
	name: t.String({ minLength: 3, maxLength: 64 }),
});

export const tApplication = t.Object({
	id: tApplicationId,
	name: t.String({ minLength: 3, maxLength: 64 }),
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