"Start pathogen
execute pathogen#infect()

"Enable syntax highlighting
syntax on
set nu

"Enable autoindenting
set autoindent

"Set the colorscheme, monokai master race!
if has("gui_running")
    colorscheme spacegray
else
    colorscheme desert
endif

"Set the bakspace options
set backspace=indent,eol,start

"Change the indent settings
set tabstop=4
set shiftwidth=4

set expandtab
