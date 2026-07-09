---
title: "My index-page"
permalink: index.html
---

{%- extends "layouts/base.njk" -%}

{% block content %}

{{ component.h({
  level: 2,
  text: "What a great headline"
}) }}

{{ component.demolist({i:6}) }}

<browser-support data-feature="grid"></browser-support>
<browser-support data-feature="shadow-dom"></browser-support>
<browser-support data-feature="scroll-snap"></browser-support>
<browser-support data-feature="view-transitions"></browser-support>

{% endblock %}
