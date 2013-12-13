
  
  /**
   *  Organization form 
   *
   */


  cdb.admin.organization.Form = cdb.core.View.extend({

    _TEXTS: {
      delete: {
        title:        _t("Delete <%= username %>'s account"),
        description:  _t("You are about to delete <%= username %> account. \
                          Doing so will delete all tables and visualizations. \
                          Are you sure?"),
        ok:           _t("Yes, do it")
      },
      assigned:       _t("assigned")
    },

    events: {
      'click .delete':        '_onDeleteClick',
      'click .change_quota':  '_onChangeQuotaClick'
    },

    initialize: function() {
      this.user = this.options.user;

      // Set user quota from input if
      this._setUserQuota();

      this._initViews();
      this._initBinds();
    },

    render: function() {
      this.clearSubViews();

      // Quota assigned label
      this.$('label strong').text(
        cdb.Utils.readablizeBytes(this.user.get('quota_in_bytes')) +
        " " + 
        this._TEXTS.assigned
      );

      // Organization quota progress
      this.$('.progress-bar').html('');
      var progress_bar = new cdb.admin.organization.ProgressQuota({
        model: this.model,
        user: this.user,
        collection: this.collection
      });
      
      this.$('.progress-bar').append(progress_bar.render().el);
      this.addView(progress_bar);

      return this;
    },

    _setUserQuota: function() {
      if (!this.user.get('username')) {
        this.user.set('quota_in_bytes', this.$("#user_quota").val());
      }
    },

    _initViews: function() {
      // Field errors
      if (this.$('div.field > div.error').length > 0) {
        this.$('div.error').each(this._setFieldError);
      }
    },

    _initBinds: function() {
      this.user.bind('change:quota_in_bytes', function(m, quota) {
        this.$("#user_quota").val(quota);
        this.render();
      }, this)
    },

    _setFieldError: function(pos, el) {
      var $field = $(el).closest('div.field');
      $field.addClass('field_with_errors');

      $(el).tipsy({
        fade: true,
        gravity: "s",
        offset: 5,
        className: 'error_tooltip',
        title: function() {
          return $(this).text()
        }
      });
    },

    _onChangeQuotaClick: function(e) {
      if (e) e.preventDefault();

      var dlg = new cdb.admin.organization.QuotaDialog({
        user: this.user,
        collection: this.collection,
        organization: this.model
      });

      dlg
        .appendToBody()
        .open();
    },

    _onDeleteClick: function(e) {
      if (e) e.preventDefault();
      var href = $(e.target).attr('href');
      var self = this;

      var dlg = new cdb.admin.BaseDialog({
        title: _.template(this._TEXTS.delete.title)(this.user.toJSON()),
        description: _.template(this._TEXTS.delete.description)(this.user.toJSON()),
        template_name: 'common/views/confirm_dialog',
        clean_on_hide: true,
        enter_to_confirm: true,
        ok_button_classes: "right button grey",
        ok_title: this._TEXTS.delete.ok,
        cancel_button_classes: "underline margin15",
        modal_type: "error",
        width: 500
      });

      dlg.ok = function() {
        self.user.destroy({
          sucess: function() {
            window.location.href = "/organization"
          }
        })
      }

      dlg
        .appendToBody()
        .open();
    }

  });