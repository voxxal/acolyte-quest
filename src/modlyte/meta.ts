export const defaultModSettings: ModSettings = {
  name: "Your Mod",
  author: "You!",
  description: (new Date()).toString(),

  titleLeft: "Acolyte",
  titleRight: "Fight", 

  subtitleLeft: "",
  subtitleRight: "",

  private: false, 
}

interface BuildModSettingsArgs {
  name: string;
  author: string;
  description?: string;
  title?: string[];
  subtitle?: string[];
  privateMod?: boolean;
}

export const buildModSettings = ({
  name,
  author,
  description = "",
  title = name.split(/ (.*)/),
  subtitle = ["", ""],
  privateMod = false,
}: BuildModSettingsArgs): ModSettings => {
  return {
    name,
    author,
    description,

    titleLeft: title[0],
    titleRight: title[1],
    
    subtitleLeft: subtitle[0],
    subtitleRight: subtitle[1],
    private: privateMod,
  }
}
