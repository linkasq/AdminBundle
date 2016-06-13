<?php

namespace Creonit\AdminBundle\Component\Field;

use Creonit\AdminBundle\Component\Request\ComponentRequest;

class CheckboxField extends Field
{

    public function extract(ComponentRequest $request)
    {
        $this->data = $request->data->has($this->name);
    }

}
