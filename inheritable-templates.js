'use strict';

Polymer( 'inheritable-templates', {
	ready : function(){
		this.internalTemplates  = {};
		this.externalTemplates  = {};
		this.sources            = {};
		this.allowedExternalIds = {};
	}

	, attached : function(){
		this.parent = this.parentNode;
		this.parent.host && ( this.parent = this.parent.host );
		this.parentShadow = this.parent.shadowRoot;
	}

	, domReady : function(){
		// if the parent doesn't have a shadow dom we're probably in a browser that doesn't support it, so we don't need to do anything
		if( this.parentShadow ){
			this.attachMutationObservers();

			[].filter.call( this.parent.childNodes, this.registerExternalTemplate.bind( this ) );
		}
	}

	, attachMutationObservers : function(){
		new MutationObserver( this.onMutation.bind( this ) )
			.observe( this.parent, { childList : true } );
	}

	, onMutation : function( mutations ){
		mutations.forEach( function( mutation ){
			[].forEach.call( mutation.addedNodes  , this.registerExternalTemplate.bind( this ) );
			[].forEach.call( mutation.removedNodes, this.removeExternalTemplate  .bind( this ) );
		}.bind( this ) );
	}

	, registerExternalTemplate : function( tplNode ){
		var tplId;

		// node must be a template with a unique id
		if( ( tplNode.nodeName !== 'TEMPLATE' ) || !( tplId = tplNode.getAttribute( 'id' ) ) || this.externalTemplates[ tplId ] ){ return; }

		if( this.externalTemplates[ tplId ] ){
			this.parentShadow.removeChild( this.externalTemplates[ tplId ] );
		}

		this.externalTemplates[ tplId ] = tplNode.ref_.cloneNode( true );
		this.externalTemplates[ tplId ].setAttribute( 'id', 'external-' + tplId );
		this.parentShadow.appendChild( this.externalTemplates[ tplId ] );

		this.useExternal( tplId );
	}

	, removeExternalTemplate : function( tplNode ){
		var tplId;

		// node must be a template with an id
		if( ( tplNode.nodeName !== 'TEMPLATE' ) || !( tplId = tplNode.getAttribute( 'id' ) ) || !this.externalTemplates[ tplId ] ){ return; }

		delete this.externalTemplates[ tplId ];
		this.useInternal( tplId );
	}

	, idsChanged : function(){
		if( 'string' === typeof this.ids ){
			this.ids = this.ids.split( /\s*,\s*/g );
		}

		var idMap = this.allowedExternalIds = {};
		this.ids.forEach( function( id ){ idMap[ id ] = 1; } );

		Object.keys( this.sources ).forEach( function( source ){
			if( this.sources[ source ] === 'internal' ){
				if( idMap[ source ] ){
					this.useExternal( source );
				}
			}else{ // source === 'external'
				if( !idMap[ source ] ){
					this.useInternal( source );
				}
			}
		}.bind( this ) );
	}

	, useExternal : function( tplName ){ this.setInternalTemplateSource( tplName, 'external' ); }
	, useInternal : function( tplName ){ this.setInternalTemplateSource( tplName, 'internal' ); }

	, setInternalTemplateSource : function( tplName, source ){
		if( !this.parentShadow ){ return; }

		switch( source ){
			case 'internal':
				this.parent.$[ tplName ].removeAttribute( 'ref' );
				this.sources[ tplName ] = 'internal';
				break;

			case 'external':
				if( !this.allowedExternalIds[ tplName ] || !this.externalTemplates[ tplName ] ){ return; }

				this.parent.$[ tplName ].setAttribute( 'ref', 'external-' + tplName );
				this.sources[ tplName ] = 'external';
				break;
		}
	}
} );