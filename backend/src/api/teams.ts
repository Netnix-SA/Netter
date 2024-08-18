import { db } from "../db/index";
import type { Label, Team } from "../db/types";
import { Elysia, t } from "elysia";
import { tLabel, tMember, tTeam, tTeamPost } from "./schemas";
import { RecordId, StringRecordId, surql } from "surrealdb";
import { map as mapLabel } from './labels';

export const teams = new Elysia({ prefix: "/teams", tags: ["Teams"] });

teams.post("", async ({ body }) => {
	await db.create<Omit<Team, "id">>("Team", { name: body.name, description: body.description, color: body.color, icon: body.icon, lead: body.lead ? new RecordId("User", body.lead) : undefined, members: [], teams: [] } as Team);
}, {
	body: tTeamPost,
	detail: {
		description: "Creates a team in an organization"
	}
});

teams.get("", async () => {
	const teams = await db.select<Team>("Team");

	return teams.map(map);
}, {
	response: t.Array(tTeam),
	detail: {
		description: "Returns all users that belong to the querying user's organization.",
	}
})

teams.post("/:id/members", async ({ params: { id }, body: { user } }) => {
	const team_id = new StringRecordId(id);

	const team = await db.select<Team>(team_id);

	const user_id = new StringRecordId(user);

	const existing_member = team.members.find(m => user_id);

	// If member already exists bail out.
	if (existing_member !== undefined) {
		return;
	}

	await db.merge<Team>(team_id, { members: [...team.members, user_id] });
}, {
	body: tMember,
	detail: {
		description: "Adds a member to a team. Does nothing if the user is already a member."
	}
});

teams.patch("/:tid/members/:uid", ({ params: { tid , uid} }) => {

}, { body: tMember, detail: { description: "Modifies a member of a team" } });

teams.delete("/:tid/members/:uid", async ({ params: { tid , uid} }) => {
	const team = await db.select<Team>(new StringRecordId(tid));

	await db.merge<Team>(new StringRecordId(tid), { members: team.members.filter(m => m !== new StringRecordId(uid)) });
}, {
	detail: {
		description: "Removes a member from a team. It removes the member with the matching User id."
	}
});

teams.get("/:id/labels", async ({ params: { id } }) => {
	const results = await db.query<[Label[]]>(surql`SELECT * FROM Label WHERE owner == ${new StringRecordId(id)};`);

	const labels = results[0];

	return labels.map(mapLabel);
}, {
	response: t.Array(tLabel),
});

export const map = ({ id, name, members }: Team) => ({
	id: id.toString(),
	name,
	members: members.map(member => ({
		id: member.toString(),
	})),
})