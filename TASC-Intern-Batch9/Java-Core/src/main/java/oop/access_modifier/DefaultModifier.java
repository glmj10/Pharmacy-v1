package oop.access_modifier;


//Access modifier: default
class DefaultModifier {
    public int x = 2;
    public int y = 3;

    @Override
    public String toString() {
        return "Default modifier test: " + x + " " + y;
    }

    int sum() {
        return x + y;
    }
}
