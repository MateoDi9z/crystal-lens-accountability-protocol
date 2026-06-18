import { redirect } from "@sveltejs/kit";
import { appPaths } from "$lib/config/paths";

export function load() {
	redirect(307, appPaths.discover);
}