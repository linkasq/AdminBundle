<?php

namespace Creonit\AdminBundle\Component;

use Creonit\AdminBundle\Component\Pattern\EditorPattern;
use Creonit\AdminBundle\Component\Pattern\Pattern;

abstract class EditorComponent extends Component
{
    protected function prepareSchema()
    {
       
    }

    public function applySchemaAnnotation($annotation)
    {
        switch($annotation['key']){
            case 'jopa':
                break;
            default:
                parent::applySchemaAnnotation($annotation);
        }
    }

    /**
     * @param $name
     * @return EditorPattern
     */
    public function createPattern($name)
    {
        $pattern = $this->container->get('creonit_admin.component.pattern.editor');
        $pattern->setName($name);
        return $pattern;
    }


}