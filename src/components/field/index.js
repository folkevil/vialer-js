module.exports = (app) => {
    /**
    * @memberof fg.components
    */
    const Field = {
        computed: {
            /**
             * Validation flag being used to conditionally render
             * validation-helper styling.
             * @returns {Boolean} - Whether the field is valid or not.
             */
            invalidFieldValue: function() {
                if (!this.validation) return null
                if (!this.validation.$dirty) return null
                // Validation for `requiredIf` depends on the state of other
                // fields. Therefor don't use the $dirty check on this field,
                // but go straight for the $invalid state.
                if ('requiredIf' in this.validation) {
                    return this.validation.$invalid
                }

                // Invalid has 3 states: true, false and null (not changed/dirty).
                return this.validation.$error
            },
            /**
             * Match a validation error with a (translated) error message.
             * @returns {Array} - An array of translated error messages.
             */
            validationMessage: function() {
                let errorMessages = []
                const v = this.validation

                if (!v) return errorMessages

                if (v.apiResponse === false) {
                    errorMessages.push(this.$t(v.$params.apiResponse.message))
                }

                if (v.domain === false) {
                    errorMessages.push(this.$t('Please fill in a valid domain.'))
                }

                if (v.email === false) {
                    errorMessages.push(this.$t('Please fill in a valid email address.'))
                }

                if (v.maxLength === false) {
                    errorMessages.push(this.$t(
                        'Please fill in a value no longer than {max} characters.', {
                            max: v.$params.maxLength.max,
                        })
                    )
                }

                if (v.minLength === false) {
                    errorMessages.push(this.$t(
                        'Please fill in a value of at least {min} characters.', {
                            min: v.$params.minLength.min,
                        })
                    )
                }

                if (v.numeric === false) {
                    errorMessages.push(this.$t('Please fill in a valid number.'))
                }

                if (v.must_be_unique === false) {
                    errorMessages.push(this.$t('Please fill in a unique value.'))
                }

                if (v.required === false) {
                    errorMessages.push(this.$t('This field is required.'))
                }

                if (v.requiredIf === false) {
                    errorMessages.push(this.$t('This field is required.'))
                }

                if (v.sameAs === false) {
                    errorMessages.push(this.$t('Field "{fieldName}" must have the same value.', {
                        fieldName: v.$params.sameAs.eq,
                    }))
                }

                if (v.url === false) {
                    errorMessages.push(this.$t('Please fill in a valid url.'))
                }

                return errorMessages.join('</br>')
            },
        },
        methods: {
            classes: function(block) {
                let classes = {}
                if (block === 'input') {
                    classes.input = true
                    if (this.invalidFieldValue) classes['is-danger'] = true
                } else if (block === 'select') {
                    classes.select = true
                    if (this.invalidFieldValue) classes['is-danger'] = true
                } else if (block === 'label') {
                    // Field has no validation at all.
                    if (this.validation) {
                        if (this.validation.required === false || this.validation.required === true) {
                            classes.required = true
                        }
                    }
                }

                return classes
            },
            /**
            * This is the default value for a select that has no options.
            * @returns {Object} - An empty select option.
            */
            emptySelectOption: function() {
                // Handle syncing an empty option to the model.
                let emptyOption = {id: null, name: null}
                // Use the first option to determine additional keys.
                if (this.options.length) {
                    for (let key of Object.keys(this.options[0])) {
                        emptyOption[key] = null
                    }
                }
                return emptyOption
            },
            /**
            * Emit the child component's state back to it's
            * parent component. The parent container captures the value
            * using `:model.sync` instead of `v-model`.
            * @param {Event} event - The original browser event that triggered the change.
            */
            updateModel: function(event) {
                let value = event.target.value
                // Toggles value of a checkbox.
                if (event.target.type === 'checkbox') {
                    this.$emit('update:model', event.target.checked)
                } else if (['password', 'text'].includes(event.target.type)) {
                    this.$emit('update:model', event.target.value)
                } else if (event.target.tagName === 'SELECT') {
                    // A multiselect.
                    if (event.target.multiple) {
                        let selectedOptions = Array.prototype.filter.apply(event.target.options, [(i) => i.selected])
                        // Note that the value is parsed to a Number. Selected
                        // state fails without casting to the proper type.
                        value = selectedOptions.map((o) => parseInt(o.value))
                    }

                    if (!value) {
                        this.$emit('update:model', this.emptySelectOption())
                    } else {
                        for (const option of this.options) {
                            if (String(option.id) === String(value)) {
                                this.$emit('update:model', option)
                            }
                        }
                    }
                } else if (event.target.tagName === 'TEXTAREA') {
                    // For now assume each line is an item in an Array, because
                    // it suits the usecases for the blacklist items. Extend
                    // when other usecases (plain text) are required.
                    let items = event.target.value.split('\n')
                    this.$emit('update:model', items)
                }

                if (this.validation) this.validation.$touch()
            },
        },
        mounted: function() {
            if (this.type === 'select') {
                // There are no options which means there won't be a filled
                // model value. Force an update here, because the model value
                // may still be cached from the store.
                if (!this.options.length) {
                    this.$emit('update:model', this.emptySelectOption())
                }
            }
        },
        props: {
            autofocus: Boolean,
            change: Function,
            click: Function,
            disabled: Boolean,
            empty: {
                default: 'No options available',
                type: String,
            },
            help: String,
            idfield: {
                default: 'id',
            },
            label: String,
            model: null,
            name: '',
            options: Array,
            placeholder: String,
            type: String,
            validation: Object,
        },
        render: templates.field.r,
        staticRenderFns: templates.field.s,
    }

    return Field
}
