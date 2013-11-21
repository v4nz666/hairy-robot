package space.ai.component.operation;

import space.ai.component.Component;

public class Modulo extends Component {
  public Component.Value<Integer> dividend, divisor;
  public Component.Value<Integer> result = new Component.Value<Integer>() {
    @Override public Integer value() { return dividend.value() % divisor.value(); }
  };
}