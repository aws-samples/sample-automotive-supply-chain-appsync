// lib/api/resolvers/DateScalar.ts
function request() {
  return {};
}
function response(ctx) {
  const { result } = ctx;
  if (result instanceof Date) {
    return result.toISOString().split("T")[0];
  }
  return result;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vRGF0ZVNjYWxhci50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFFTyxTQUFTLFVBQVU7QUFDdEIsU0FBTyxDQUFDO0FBQ1Y7QUFFSyxTQUFTLFNBQVMsS0FBYztBQUN2QyxRQUFNLEVBQUUsT0FBTyxJQUFJO0FBQ25CLE1BQUksa0JBQWtCLE1BQU07QUFDeEIsV0FBTyxPQUFPLFlBQVksRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQUEsRUFDNUM7QUFDQSxTQUFPO0FBQ1A7IiwKICAibmFtZXMiOiBbXQp9Cg==
