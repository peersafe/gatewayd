var _ = require('lodash');

module.exports = {

  /**
   * Function takes a request of pagination fields and builds a query object to be used in conjunction with a
   * Model.find()
   *
   * @param {Object} request                    - Holds various request fields
   *  @param {String} count                     - Amount of records to fetch
   *  @param {String} index                     - ID of record to start from
   *  @param {String} sort_field                - column to order by (default: createdAt)
   *  @param {String} sort_direction            - asc or desc, correlated to sort_field (default: desc)
   *
   * @returns {Object} Object used when calling Model.find()
   */
  buildModelPagination: function (request) {
    var _this = this;
    var query = {};

    if (request.sort_direction) {
      request.sort_direction = request.sort_direction.toUpperCase();
    }

    var defaults = {
      order: '"createdAt"',
      sortDirection: 'DESC',
      limit: 30
    };

    var override = {
      order: request.sort_field,
      sortDirection: request.sort_direction,
      limit: request.count
    };

    _.defaults(override, defaults);

    if (!_.isEmpty(request.index)) {
      var where = {id: {}};
      if (override.sortDirection === 'DESC') {
        where.id.lt = request.index;
      } else {
        where.id.gt = request.index;
      }
      query.where = where;
    }

    query.limit = override.limit;
    query.order = override.order + ' ' + override.sortDirection;

    return _this.mergeQueryParams(request, query);
  },

  /**
   * Function removes the pagination related params from a request and merges the where parameters with the formatted
   * sequelize pagination object
   *
   * @param {Object} request                    - Holds various request fields from the resource endpoint
   * @param {Object} query                      - Sequelize object to be used when doing a Model.find()
   *
   * @returns {Object} Object used when calling Model.find()
   */
  mergeQueryParams: function(request, query) {
    var combine = _.clone(query, true);
    var exclusions = ['count', 'index', 'sort_direction', 'sort_field'];
    for (var field in request) {
      if (!_.contains(exclusions, field)) {
        combine.where[field] = request[field];
      }
    }
    return combine;
  }
};
