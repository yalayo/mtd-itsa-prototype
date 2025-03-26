// This is a minimal module-format worker for testing
export default {
  async fetch(request, env, ctx) {
    return new Response("Hello World in module format!");
  }
};