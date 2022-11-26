---
title: "My index-page"
---
{%- extends "layouts/base.njk" -%}

{% block content %}

{{ macro.h({
  level: 2,
  text: "What a great headline"
}) }}

{% endblock %}
