/**
 * This file defines filters that attach to bindings in 
 * partial view templates and return a custom transformation
 * of their input.
 * 
 * @author lambert8
 * @see https://opensource.ncsa.illinois.edu/confluence/display/~lambert8/Filters
 */
angular.module('ndslabs')
/**
 * Given a stack, return a list of ALL of its services' endpoints
 */
.filter('allEndpoints', ['_', function(_) {
  return function(stack) {
    var endpoints = [];
    angular.forEach(stack.services, function(svc) {
      endpoints = _.concat(endpoints, svc.endpoints);
    });
    return endpoints;
  };
}])
/**
 * Given a service spec key, retrieve its label
 */
.filter('specProperty', ['Specs', '_', function(Specs, _) {
  return function(key, propertyName) {
    var spec = _.find(Specs.all, [ 'key', key ]);
    
    if (!spec) {
      return '';
    }
    
    return spec[propertyName];
  };
}])
/**
 * Given a stack id, retrieve the given property of the stack
 */
.filter('stackProperty', ['Stacks', '_', function(Stacks, _) {
  return function(key, propertyName, serviceProperty) {
    // Generic "find" that utilizes our hierarchical id scheme
    var stack = _.find(Stacks.all, function(stk) {
      if (key.indexOf(stk.id) !== -1) {
        return stk;
      }
    });
    
    if (!stack) {
      return '';
    }
    
    // If this is a stack property, return it.. if not, drill down to services
    if (!serviceProperty) {
      return stack[propertyName];
    }
    
    var svc = _.find(stack.services, ['id', key ]);
    return svc[propertyName];
  };
}])
/**
 * Given a stack service id, retrieve attached volumes for the service
 */
.filter('stackSvcVolumes', ['Volumes', '_', function(Volumes, _) {
  return function(svcId) {
    var volumes = _.filter(Volumes.all, [ 'attached', svcId ]);
    return volumes;
  };
}])
/**
 * Given a stack id, retrieve attached volumes for the entire stack
 */
.filter('stackVolumes', ['Stacks', 'Volumes', '_', function(Stacks, Volumes, _) {
  return function(stackId) {
    var stack = _.filter(Stacks.all, [ 'id', stackId ]);
    
    if (!stack) {
      return [];
    }
    
    var volumes = [];
    angular.forEach(stack.services, function(svc) {
      _.concat(volumes, _.filter(Volumes.all, [ 'attached', svc.id ]));
    });
    return volumes;
  };
}])
/**
 * Given a string, capitalize it
 */ 
.filter('capitalize', [ '_', function(_) {
  return function(input) {
    return _.capitalize(input);
  };
}])
/**
 * Given a string, convert any ANSI control characters into HTML
 * 
 * TODO: How unsafe is this?
 */
.filter('ansi', [ '$sce', 'ansi2html', function($sce, ansi) {
  return function(input) {
    return $sce.trustAsHtml(ansi.toHtml(input));
  };
}])
/**
 * Given a list of services and a target service, check the list of 
 * services to see if our target service is a required dependency
 * of any of the others
 */ 
.filter('isRecursivelyRequired', [ 'Specs', function(Specs) {
  return function(services, service) {
    var result = false;
    angular.forEach(services, function(svc) {
      var spec = _.find(Specs.all, { 'key': svc.service });
      if (spec) {
        var dep = _.find(spec.depends, _.matchesProperty('key', service.service));
        if (dep && dep.required === true) {
          result = true;
        }
      }
    });
    return result;
  };
}])
/**
 * Returns true iff the given stack has missing options that the user can enable
 */ 
.filter('missingDeps', [ '$log', 'Specs', function($log, Specs) {
  // Returns any options missing from a stack
  return function(stack) {
    if (!Specs.all || !Specs.all.length) {
      return [];
    }
    
    var spec = _.find(Specs.all, ['key', stack.key]);
    if (spec) {
      var options = _.filter(angular.copy(spec.depends), [ 'required', false ]);
      var missing = [];
      angular.forEach(options, function(op) {
        if (!_.find(stack.services, [ 'service', op.key ])) {
          missing.push(op);
        }
      });
      return missing;
    } else {
      $log.error("Cannot locate missing optional dependencies - key not found: " + stack.key);
    }
    return false;
  };
}])
/**
 * Given a service spec key, list all optional dependencies for the spec
 */ 
.filter('options', [ '$log', 'Specs', function($log, Specs) {
  // Returns a list of options for a spec
  return function(key) {
    if (!Specs.all || !Specs.all.length) {
      return [];
    }
    
    var spec = _.find(Specs.all, ['key', key]);
    if (spec) {
      var options = _.filter(spec.depends, [ 'required', false ]);
      return options;
    } else {
      $log.error("Cannot locate options - key not found: " + key);
    }
    return [];
  };
}])
/**
 * Given a service spec key, list all required dependencies for the spec
 */ 
.filter('requirements', [ '$log', 'Specs', function($log, Specs) {
  // Return a list of requirements for a spec
  return function(key) {
    if (!Specs.all || !Specs.all.length) {
      return [];
    }
    
    var spec = _.find(Specs.all, ['key', key]);
    if (spec) {
      var requirements = _.filter(spec.depends, [ 'required', true ]);
      return requirements;
    } else {
      $log.error("Cannot locate requirements - key not found: " + key);
    }
    return [];
  };
}])
.filter('formatDependencies', [ 'Specs', function(Specs) {
  return function(deps) {
    var getLabel = function(specKey) {
      return _.find(Specs.all, [ 'key', specKey]).label;
    }
    
    var ret = '';
    switch(deps.length) {
      case 0:
        return '';
      case 1:
        return getLabel(deps[0]);
      case 2:
        return getLabel(deps[0]) + ' and ' + getLabel(deps[1]);
      default:
        angular.forEach(_.slice(deps, 1), function(dep) {
          if (deps.indexOf(dep) === deps.length) {
            ret += ', and ' + getLabel(dep);
          } else {
            ret += ', ' + getLabel(dep);
          }
        });
        return ret;
    }
  };
}])
/**
 * Given a list of orphaned volumes and a service name,
 * return any orphans matching that service
 */ 
.filter('orphansExist', function() {
  return function(orphans, service) {
    var matches = [];
    angular.forEach(orphans, function(orphan) {
      if (orphan.service === service) {
        matches.push(orphan);
      }
    });
    return matches;
  };
});