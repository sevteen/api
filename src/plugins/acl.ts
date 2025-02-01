import fp from "fastify-plugin";

const sampleACL = [{ path: ["/path"], read: [1], write: [2], delete: [3] }];

export default fp(
  async (fastify) => {
    fastify.log.info("Acl plugin starting");
    // eslint-disable-next-line consistent-return
    fastify.addHook("preHandler", (request, reply, done): unknown => {
      const { method, url } = request;

      const aclEntry = sampleACL.find((r) => r.path.includes(url));

      // doesnt have acl on this path
      // so we don't need saving a session for acl
      if (!aclEntry) {
        return done();
      }

      let allowedAccess = false;

      const { read: readAcl, write: writeAcl, delete: deleteAcl } = aclEntry;

      const methodAclMap = {
        get: readAcl,
        post: writeAcl,
        patch: writeAcl,
        delete: deleteAcl,
      };

      const userAcls = [1];

      const acls =
        methodAclMap[method.toLowerCase() as keyof typeof methodAclMap];
      if (acls && acls.length > 0) {
        allowedAccess = userAcls.some((acl) => acls.includes(acl));
      } else {
        allowedAccess = true;
      }

      if (!allowedAccess) {
        return reply.forbidden("Sorry, You are not allowed!");
      }

      done();
    });
  },
  { name: "acl", dependencies: [] },
);
