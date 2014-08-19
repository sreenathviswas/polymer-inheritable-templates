This element allows external templates to be pulled in and used internally in a polymer element.

example:

```html
<polymer-element name="my-custom-element">
	<template>
		<inheritable-templates ids="tags"></inheritable-templates>

		<template id="tags">
			Render tags here
		</template>

		<template repeat="{{ foo in bar }}">
			<template ref="tags" bind="{{ foo }}"></template>
		</template>
	</template>

	<script>Polymer( 'my-custom-element', {} );</script>
</polymer-element>

<my-custom-element>
    <template id="tags">
    	This template will be used instead of the internal "tags" template
    </template>
</my-custom-element>
```

Templates will automatically get replaced on appropriate DOM events like adding or removing the template nodes.