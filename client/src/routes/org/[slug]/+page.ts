import { redirect } from "@sveltejs/kit";
import { appPaths } from "$lib/config/paths";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
	redirect(308, appPaths.org(params.slug));
};