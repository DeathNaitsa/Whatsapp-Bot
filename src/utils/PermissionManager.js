class PermissionManager {
  constructor(config) {
    this.roles = config.team.roles;
    this.roleHierarchy = this.buildHierarchy();
  }

  buildHierarchy() {
    const hierarchy = [];
    for (const [roleName, roleData] of Object.entries(this.roles)) {
      hierarchy.push({ name: roleName, level: roleData.level });
    }
    return hierarchy.sort((a, b) => b.level - a.level);
  }

  hasPermission(user, permission) {
    if (!user || !user.teamm) return false;
    
    const role = this.roles[user.teamm.toLowerCase()];
    if (!role) return false;

    if (role.permissions.includes('*')) return true;
    return role.permissions.includes(permission);
  }

  hasRole(user, roleName) {
    if (!user || !user.teamm) return false;
    
    const userRole = this.roles[user.teamm.toLowerCase()];
    const requiredRole = this.roles[roleName.toLowerCase()];
    
    if (!userRole || !requiredRole) return false;
    
    return userRole.level >= requiredRole.level;
  }

  getRole(user) {
    if (!user || !user.teamm) return null;
    return this.roles[user.teamm.toLowerCase()] || null;
  }

  getUserPermissions(user) {
    const role = this.getRole(user);
    if (!role) return [];
    return role.permissions;
  }

  isOwner(user) {
    if (user && user.teamm) {
      const teamRole = user.teamm.toLowerCase();
      if (teamRole === 'ersteller' || teamRole === 'inhaber' || teamRole === 'owner') {
        return true;
      }
    }
    return this.hasRole(user, 'owner') || this.hasRole(user, 'inhaber') || this.hasRole(user, 'ersteller');
  }

  isTeam(user) {
    return user && user.teamm && this.roles[user.teamm.toLowerCase()];
  }

  getRoleLevel(roleName) {
    const role = this.roles[roleName.toLowerCase()];
    return role ? role.level : 0;
  }

  compareRoles(role1, role2) {
    const level1 = this.getRoleLevel(role1);
    const level2 = this.getRoleLevel(role2);
    return level1 - level2;
  }

  getAllRoles() {
    return this.roleHierarchy;
  }

  roleExists(roleName) {
    return this.roles.hasOwnProperty(roleName.toLowerCase());
  }

  getScratchPermissions(user) {
    const role = this.getRole(user);
    if (!role) return { blocks: [], canUseJs: false };

    const permissions = {
      blocks: [],
      canUseJs: false,
      maxComplexity: 0
    };

    if (this.hasPermission(user, 'scratch_full')) {
      permissions.blocks = ['all'];
      permissions.canUseJs = true;
      permissions.maxComplexity = 100;
    } else if (this.hasPermission(user, 'scratch_advanced')) {
      permissions.blocks = ['text', 'logic', 'loops', 'variables', 'api', 'database', 'messages'];
      permissions.canUseJs = false;
      permissions.maxComplexity = 50;
    } else if (this.hasPermission(user, 'scratch_basic')) {
      permissions.blocks = ['text', 'logic', 'messages'];
      permissions.canUseJs = false;
      permissions.maxComplexity = 20;
    }

    return permissions;
  }
}

export default PermissionManager;
