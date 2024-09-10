import { expect, test } from "bun:test";

import { parse_mentions } from "../src/utils";

test("Parse valid mentions", () => {
	expect(parse_mentions("Hello @User:yt2hrlb0mynjar8q5la5!")).toEqual(["User:yt2hrlb0mynjar8q5la5"]);
	expect(parse_mentions("Hello @User:yt2hrlb0mynjar8q5la5! @Task:33howl8sax15f4spwkow!")).toEqual(["User:yt2hrlb0mynjar8q5la5", "Task:33howl8sax15f4spwkow"]);
	expect(parse_mentions("Hello di@na!")).toEqual([]);
});

test("Parse invalid mentions", () => {
	expect(parse_mentions("Hello di@na!")).toEqual([]);
});

test.todo("Test full-text search");